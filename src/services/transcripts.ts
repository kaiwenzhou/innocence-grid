import { supabase } from '@/lib/supabase';
import type { Transcript } from '@/lib/types';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker - use the worker from node_modules
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

/**
 * Transcript Service Layer
 *
 * This service handles all transcript operations with Supabase.
 */

export class TranscriptService {
  /**
   * Fetch all transcripts with their predictions
   */
  static async getAllTranscripts(): Promise<Transcript[]> {
    const { data: transcripts, error } = await supabase
      .from('transcripts')
      .select('*')
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Error fetching transcripts:', error);
      throw error;
    }

    if (!transcripts) return [];

    // Fetch predictions for each transcript (most recent only)
    const transcriptsWithPredictions = await Promise.all(
      transcripts.map(async (transcript) => {
        const { data: prediction } = await supabase
          .from('predictions')
          .select('*')
          .eq('transcript_id', transcript.id)
          .order('analyzed_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        return {
          ...transcript,
          prediction: prediction || undefined,
        };
      })
    );

    return transcriptsWithPredictions;
  }

  /**
   * Fetch a single transcript by ID with its prediction
   */
  static async getTranscriptById(id: string): Promise<Transcript | null> {
    const { data: transcript, error } = await supabase
      .from('transcripts')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching transcript:', error);
      throw error;
    }

    if (!transcript) return null;

    // Fetch the most recent prediction for this transcript
    const { data: prediction } = await supabase
      .from('predictions')
      .select('*')
      .eq('transcript_id', id)
      .order('analyzed_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return {
      ...transcript,
      prediction: prediction || undefined,
    };
  }

  /**
   * Extract text from PDF file
   */
  private static async extractTextFromPDF(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }

    return fullText.trim();
  }

  /**
   * Upload a new transcript
   * Extracts text from file and stores in database
   * Supports both .txt and .pdf files
   */
  static async uploadTranscript(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<{ success: boolean; transcriptId?: string; error?: string }> {
    try {
      let text: string;

      // Extract text based on file type
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        onProgress?.(10);
        text = await this.extractTextFromPDF(file);
        onProgress?.(50);
      } else {
        // Plain text file
        text = await file.text();
        onProgress?.(50);
      }

      // Extract metadata from transcript content
      const metadata = this.extractMetadataFromContent(text);

      // Insert the transcript (database will generate UUID via DEFAULT)
      const { data, error } = await supabase
        .from('transcripts')
        .insert({
          file_name: file.name,
          raw_text: text,
          hearing_date: metadata.hearingDate,
          inmate_name: metadata.inmateName,
          cdcr_number: metadata.cdcrNumber,
          processed: false,
        })
        .select()
        .single();

      onProgress?.(100);

      if (error) {
        console.error('Error uploading transcript:', error);
        return { success: false, error: error.message };
      }

      return { success: true, transcriptId: data.id };
    } catch (err) {
      console.error('Error uploading transcript:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  }

  /**
   * Fix malformed names where single letters are separated by spaces
   * e.g., "M ICHAEL" -> "MICHAEL", "W ARDELL" -> "WARDELL"
   */
  private static fixMalformedName(name: string): string {
    // Fix pattern where single letter is followed by space then more letters
    // Match: single uppercase letter + space + uppercase letter(s)
    // Replace: merge them together
    let fixed = name.replace(/\b([A-Z])\s+([A-Z][a-z]*)/g, '$1$2');
    
    // Also handle multiple spaces
    fixed = fixed.replace(/\s+/g, ' ').trim();
    
    return fixed;
  }

  /**
   * Extract metadata from transcript content
   * Patterns:
   * - Inmate Name: "Hearing of: RAPHAEL BARRETO"
   * - CDCR Number: "CDCR Number: V96693"
   * - Hearing Date: "FEBRUARY 7, 2025"
   */
  private static extractMetadataFromContent(text: string): {
    hearingDate: string | null;
    inmateName: string | null;
    cdcrNumber: string | null;
  } {
    let inmateName: string | null = null;
    let cdcrNumber: string | null = null;
    let hearingDate: string | null = null;

    // Extract inmate name from "Hearing of:" pattern
    // Match "Hearing of:" with flexible whitespace, then capture the name
    const nameMatch = text.match(/Hearing\s+of:\s*([A-Z][A-Z\s]+?)(?:\n|CDCR)/i);
    if (nameMatch) {
      const rawName = nameMatch[1].trim();
      // Fix malformed names like "M ICHAEL" -> "MICHAEL"
      inmateName = this.fixMalformedName(rawName);
    }

    // Extract CDCR number from "CDCR Number:" pattern
    const cdcrMatch = text.match(/CDCR\s+Number:\s*([A-Z0-9]+)/i);
    if (cdcrMatch) {
      cdcrNumber = cdcrMatch[1].trim();
    }

    // Extract hearing date - pattern like "FEBRUARY 7, 2025" or "FEBRUARY 7, 2025 8:36 AM"
    const dateMatch = text.match(/\b(JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)\s+(\d{1,2}),?\s+(\d{4})/i);
    if (dateMatch) {
      const monthName = dateMatch[1];
      const day = dateMatch[2];
      const year = dateMatch[3];

      // Convert to ISO date format (YYYY-MM-DD)
      const monthMap: { [key: string]: string } = {
        'JANUARY': '01', 'FEBRUARY': '02', 'MARCH': '03', 'APRIL': '04',
        'MAY': '05', 'JUNE': '06', 'JULY': '07', 'AUGUST': '08',
        'SEPTEMBER': '09', 'OCTOBER': '10', 'NOVEMBER': '11', 'DECEMBER': '12'
      };
      const month = monthMap[monthName.toUpperCase()];
      if (month) {
        hearingDate = `${year}-${month}-${day.padStart(2, '0')}`;
      }
    }

    return {
      hearingDate,
      inmateName,
      cdcrNumber,
    };
  }

  /**
   * Filter transcripts by processed status
   */
  static async getTranscriptsByStatus(processed: boolean): Promise<Transcript[]> {
    const { data: transcripts, error } = await supabase
      .from('transcripts')
      .select('*')
      .eq('processed', processed)
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Error fetching transcripts by status:', error);
      throw error;
    }

    if (!transcripts) return [];

    // Fetch predictions for each transcript
    const transcriptsWithPredictions = await Promise.all(
      transcripts.map(async (transcript) => {
        const { data: prediction } = await supabase
          .from('predictions')
          .select('*')
          .eq('transcript_id', transcript.id)
          .order('analyzed_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        return {
          ...transcript,
          prediction: prediction || undefined,
        };
      })
    );

    return transcriptsWithPredictions;
  }

  /**
   * Get transcript statistics
   */
  static async getStatistics(): Promise<{
    total: number;
    processed: number;
    pending: number;
  }> {
    const { count: total, error: totalError } = await supabase
      .from('transcripts')
      .select('*', { count: 'exact', head: true });

    const { count: processed, error: processedError } = await supabase
      .from('transcripts')
      .select('*', { count: 'exact', head: true })
      .eq('processed', true);

    if (totalError || processedError) {
      console.error('Error fetching statistics:', totalError || processedError);
      throw totalError || processedError;
    }

    return {
      total: total || 0,
      processed: processed || 0,
      pending: (total || 0) - (processed || 0),
    };
  }

  /**
   * Delete a transcript
   */
  static async deleteTranscript(id: string): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
      .from('transcripts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting transcript:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  }
}

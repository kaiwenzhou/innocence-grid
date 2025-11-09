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
    // Fetch all transcripts
    const { data: transcripts, error: transcriptsError } = await supabase
      .from('transcripts')
      .select('*')
      .order('uploaded_at', { ascending: false });

    if (transcriptsError) {
      console.error('Error fetching transcripts:', transcriptsError);
      throw transcriptsError;
    }

    if (!transcripts || transcripts.length === 0) {
      return [];
    }

    // Fetch all predictions for these transcripts
    const transcriptIds = transcripts.map(t => t.id);
    const { data: predictions, error: predictionsError } = await supabase
      .from('predictions')
      .select('*')
      .in('transcript_id', transcriptIds)
      .order('analyzed_at', { ascending: false });

    if (predictionsError) {
      console.error('Error fetching predictions:', predictionsError);
      // Continue without predictions
    }

    // Map predictions to transcripts (most recent prediction per transcript)
    const predictionMap = new Map();
    if (predictions) {
      for (const pred of predictions) {
        if (!predictionMap.has(pred.transcript_id)) {
          predictionMap.set(pred.transcript_id, pred);
        }
      }
    }

    // Combine transcripts with their predictions
    return transcripts.map(transcript => ({
      ...transcript,
      prediction: predictionMap.get(transcript.id) || undefined,
    }));
  }

  /**
   * Fetch a single transcript by ID with its prediction
   */
  static async getTranscriptById(id: string): Promise<Transcript | null> {
    // Fetch transcript
    const { data: transcript, error: transcriptError } = await supabase
      .from('transcripts')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (transcriptError) {
      console.error('Error fetching transcript:', transcriptError);
      throw transcriptError;
    }

    if (!transcript) {
      return null;
    }

    // Fetch the most recent prediction for this transcript
    const { data: prediction, error: predictionError } = await supabase
      .from('predictions')
      .select('*')
      .eq('transcript_id', id)
      .order('analyzed_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (predictionError) {
      console.error('Error fetching prediction:', predictionError);
      // Don't throw - just return transcript without prediction
    }

    // Combine transcript with prediction
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
      inmateName = nameMatch[1].trim();
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
    const { data, error } = await supabase
      .from('transcripts')
      .select('*')
      .eq('processed', processed)
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Error fetching transcripts by status:', error);
      throw error;
    }

    return data || [];
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

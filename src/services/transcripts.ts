import { supabase } from '@/lib/supabase';
import type { Transcript } from '@/lib/types';

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
    const { data, error } = await supabase
      .from('transcripts')
      .select('*')
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Error fetching transcripts:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Fetch a single transcript by ID with its prediction
   */
  static async getTranscriptById(id: string): Promise<Transcript | null> {
    const { data, error } = await supabase
      .from('transcripts')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching transcript:', error);
      throw error;
    }

    return data;
  }

  /**
   * Upload a new transcript
   * Extracts text from file and stores in database
   */
  static async uploadTranscript(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<{ success: boolean; transcriptId?: string; error?: string }> {
    try {
      // Read the file content as text
      const text = await file.text();

      onProgress?.(50);

      // Extract metadata from filename if possible
      // Expected format: YYYY-MM-DD_InmateName_CDCRXXXXXX.txt
      const metadata = this.extractMetadataFromFilename(file.name);

      // Insert the transcript
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
   * Extract metadata from filename
   * Expected format: YYYY-MM-DD_InmateName_CDCRXXXXXX.txt
   */
  private static extractMetadataFromFilename(filename: string): {
    hearingDate: string | null;
    inmateName: string | null;
    cdcrNumber: string | null;
  } {
    // Remove file extension
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');

    // Try to match the pattern
    const parts = nameWithoutExt.split('_');

    if (parts.length >= 3) {
      const [date, name, cdcr] = parts;

      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      const hearingDate = dateRegex.test(date) ? date : null;

      return {
        hearingDate,
        inmateName: name || null,
        cdcrNumber: cdcr || null,
      };
    }

    return {
      hearingDate: null,
      inmateName: null,
      cdcrNumber: null,
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

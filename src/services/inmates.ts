/**
 * Inmate Service
 * Handles database operations for CDCR inmate information
 */

import { supabase } from '@/lib/supabase';
import { Inmate, ParoleHearing, TranscriptWithInmate } from '@/lib/types';

export class InmateService {
  /**
   * Get inmate information by CDCR number
   */
  static async getInmateByCDCR(cdcrNumber: string): Promise<Inmate | null> {
    try {
      const { data, error } = await supabase
        .from('inmates')
        .select('*')
        .eq('cdcr_number', cdcrNumber)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching inmate:', error);
      throw error;
    }
  }

  /**
   * Get parole hearings for an inmate by CDCR number
   */
  static async getParoleHearings(cdcrNumber: string): Promise<ParoleHearing[]> {
    try {
      const { data, error } = await supabase
        .from('board_of_parole_hearings')
        .select('*')
        .eq('cdcr_number', cdcrNumber)
        .order('hearing_date', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching parole hearings:', error);
      throw error;
    }
  }

  /**
   * Get transcript with inmate information
   */
  static async getTranscriptWithInmate(transcriptId: string): Promise<TranscriptWithInmate | null> {
    try {
      // First get the transcript
      const { data: transcript, error: transcriptError } = await supabase
        .from('transcripts')
        .select('*')
        .eq('id', transcriptId)
        .single();

      if (transcriptError) throw transcriptError;
      if (!transcript) return null;

      // If transcript has a CDCR number, fetch inmate data
      if (transcript.cdcr_number) {
        const [inmate, paroleHearings] = await Promise.all([
          this.getInmateByCDCR(transcript.cdcr_number),
          this.getParoleHearings(transcript.cdcr_number),
        ]);

        return {
          ...transcript,
          inmate: inmate || undefined,
          parole_hearings: paroleHearings,
        };
      }

      return transcript;
    } catch (error) {
      console.error('Error fetching transcript with inmate:', error);
      throw error;
    }
  }

  /**
   * Get all transcripts with inmate information
   */
  static async getAllTranscriptsWithInmates(): Promise<TranscriptWithInmate[]> {
    try {
      // Get all transcripts
      const { data: transcripts, error: transcriptsError } = await supabase
        .from('transcripts')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (transcriptsError) throw transcriptsError;
      if (!transcripts) return [];

      // Get unique CDCR numbers
      const cdcrNumbers = [
        ...new Set(
          transcripts
            .map((t) => t.cdcr_number)
            .filter((cdcr): cdcr is string => cdcr !== null && cdcr !== undefined)
        ),
      ];

      if (cdcrNumbers.length === 0) {
        return transcripts;
      }

      // Fetch all inmates and hearings in parallel
      const [inmatesResult, hearingsResult] = await Promise.all([
        supabase.from('inmates').select('*').in('cdcr_number', cdcrNumbers),
        supabase.from('board_of_parole_hearings').select('*').in('cdcr_number', cdcrNumbers),
      ]);

      const inmates = inmatesResult.data || [];
      const hearings = hearingsResult.data || [];

      // Create maps for quick lookup
      const inmateMap = new Map(inmates.map((i) => [i.cdcr_number, i]));
      const hearingsMap = new Map<string, ParoleHearing[]>();

      hearings.forEach((h) => {
        if (!hearingsMap.has(h.cdcr_number)) {
          hearingsMap.set(h.cdcr_number, []);
        }
        hearingsMap.get(h.cdcr_number)!.push(h);
      });

      // Combine transcripts with inmate data
      return transcripts.map((transcript) => {
        if (!transcript.cdcr_number) {
          return transcript;
        }

        return {
          ...transcript,
          inmate: inmateMap.get(transcript.cdcr_number),
          parole_hearings: hearingsMap.get(transcript.cdcr_number) || [],
        };
      });
    } catch (error) {
      console.error('Error fetching transcripts with inmates:', error);
      throw error;
    }
  }

  /**
   * Check if inmate data exists for a CDCR number
   */
  static async hasInmateData(cdcrNumber: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('inmates')
        .select('cdcr_number')
        .eq('cdcr_number', cdcrNumber)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking inmate data:', error);
      return false;
    }
  }

  /**
   * Get statistics about inmate data coverage
   */
  static async getInmateDataCoverage(): Promise<{
    totalTranscripts: number;
    transcriptsWithCDCR: number;
    transcriptsWithInmateData: number;
    coveragePercentage: number;
  }> {
    try {
      // Get total transcripts
      const { count: totalTranscripts, error: countError } = await supabase
        .from('transcripts')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;

      // Get transcripts with CDCR numbers
      const { count: transcriptsWithCDCR, error: cdcrError } = await supabase
        .from('transcripts')
        .select('*', { count: 'exact', head: true })
        .not('cdcr_number', 'is', null);

      if (cdcrError) throw cdcrError;

      // Get transcripts with inmate data (via join)
      const { count: transcriptsWithInmateData, error: inmateError } = await supabase
        .from('transcripts')
        .select('cdcr_number, inmates!inner(cdcr_number)', { count: 'exact', head: true })
        .not('cdcr_number', 'is', null);

      if (inmateError) throw inmateError;

      const total = totalTranscripts || 0;
      const withCDCR = transcriptsWithCDCR || 0;
      const withData = transcriptsWithInmateData || 0;

      return {
        totalTranscripts: total,
        transcriptsWithCDCR: withCDCR,
        transcriptsWithInmateData: withData,
        coveragePercentage: withCDCR > 0 ? (withData / withCDCR) * 100 : 0,
      };
    } catch (error) {
      console.error('Error getting inmate data coverage:', error);
      throw error;
    }
  }

  /**
   * Get all inmates
   */
  static async getAllInmates(): Promise<Inmate[]> {
    try {
      const { data, error } = await supabase
        .from('inmates')
        .select('*')
        .order('last_scraped_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching inmates:', error);
      throw error;
    }
  }

  /**
   * Get inmates that need data refresh (older than specified days)
   */
  static async getInmatesNeedingRefresh(daysOld: number = 30): Promise<string[]> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const { data, error } = await supabase
        .from('inmates')
        .select('cdcr_number')
        .lt('last_scraped_at', cutoffDate.toISOString());

      if (error) throw error;

      return data.map((i) => i.cdcr_number);
    } catch (error) {
      console.error('Error fetching inmates needing refresh:', error);
      throw error;
    }
  }
}

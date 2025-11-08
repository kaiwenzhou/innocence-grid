import { mockTranscripts, Transcript } from "@/lib/mockData";

/**
 * Transcript Service Layer
 * 
 * This service abstracts data operations for transcripts.
 * Currently uses mock data, but can be easily replaced with Supabase calls.
 * 
 * When migrating to Supabase:
 * 1. Replace mock data imports with Supabase client
 * 2. Update each function to use supabase.from('transcripts')
 * 3. Keep the same function signatures and return types
 */

export class TranscriptService {
  /**
   * Fetch all transcripts
   * 
   * Supabase equivalent:
   * const { data, error } = await supabase
   *   .from('transcripts')
   *   .select('*')
   *   .order('date_uploaded', { ascending: false });
   */
  static async getAllTranscripts(): Promise<Transcript[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockTranscripts;
  }

  /**
   * Fetch a single transcript by ID
   * 
   * Supabase equivalent:
   * const { data, error } = await supabase
   *   .from('transcripts')
   *   .select('*')
   *   .eq('id', id)
   *   .maybeSingle();
   */
  static async getTranscriptById(id: string): Promise<Transcript | null> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockTranscripts.find(t => t.id === id) || null;
  }

  /**
   * Upload a new transcript
   * 
   * Supabase equivalent:
   * // 1. Upload PDF to storage
   * const { data: fileData, error: uploadError } = await supabase.storage
   *   .from('transcripts')
   *   .upload(`${userId}/${file.name}`, file);
   * 
   * // 2. Process PDF and extract text (via edge function)
   * const { data: analysisData, error: analysisError } = await supabase.functions
   *   .invoke('analyze-transcript', { body: { fileUrl: fileData.path } });
   * 
   * // 3. Insert transcript record
   * const { data, error } = await supabase
   *   .from('transcripts')
   *   .insert({
   *     filename: file.name,
   *     content: analysisData.content,
   *     innocence_score: analysisData.innocenceScore,
   *     claims: analysisData.claims,
   *     user_id: userId
   *   })
   *   .select()
   *   .single();
   */
  static async uploadTranscript(file: File): Promise<{ success: boolean; transcriptId?: string; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock successful upload
    const newId = String(mockTranscripts.length + 1);
    return { success: true, transcriptId: newId };
  }

  /**
   * Filter transcripts by score range
   * 
   * Supabase equivalent:
   * const { data, error } = await supabase
   *   .from('transcripts')
   *   .select('*')
   *   .gte('innocence_score', minScore)
   *   .lte('innocence_score', maxScore)
   *   .order('innocence_score', { ascending: false });
   */
  static async getTranscriptsByScoreRange(minScore: number, maxScore: number): Promise<Transcript[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockTranscripts.filter(
      t => t.innocenceScore >= minScore && t.innocenceScore <= maxScore
    );
  }

  /**
   * Get transcript statistics
   * 
   * Supabase equivalent:
   * const { count: totalCount } = await supabase
   *   .from('transcripts')
   *   .select('*', { count: 'exact', head: true });
   * 
   * const { count: highRiskCount } = await supabase
   *   .from('transcripts')
   *   .select('*', { count: 'exact', head: true })
   *   .gte('innocence_score', 0.7);
   */
  static async getStatistics(): Promise<{
    total: number;
    highRisk: number;
    pending: number;
  }> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return {
      total: mockTranscripts.length,
      highRisk: mockTranscripts.filter(t => t.innocenceScore >= 0.7).length,
      pending: 3 // Mock value
    };
  }
}

import { supabase } from '@/lib/supabase';
import type { Transcript, InnocenceClaim } from '@/lib/types';
import { chunkTranscript, createContextSummary } from '@/utils/transcriptChunker';
import { analyzeChunkForInnocenceSignals, getModelInfo } from './gemini';
import { debugTranscriptSpeakers } from '@/utils/transcriptDebug';
import { preprocessTranscript } from '@/utils/transcriptPreprocessor';

/**
 * Innocence Detection Service
 *
 * Main orchestration service that:
 * 1. Chunks transcripts intelligently
 * 2. Analyzes each chunk with Gemini API
 * 3. Maintains context between chunks
 * 4. Aggregates results
 * 5. Stores findings in database
 */

export interface AnalysisProgress {
  currentChunk: number;
  totalChunks: number;
  percentage: number;
  status: string;
}

export interface AnalysisResult {
  success: boolean;
  transcriptId: string;
  explicitClaims: InnocenceClaim[];
  implicitSignals: InnocenceClaim[];
  contextualSignals: InnocenceClaim[];
  biasLanguage: InnocenceClaim[];
  innocenceScore: number;
  error?: string;
}

/**
 * Analyze a transcript for innocence signals
 *
 * This is the main entry point for analyzing a transcript.
 *
 * @param transcriptId - ID of the transcript to analyze
 * @param onProgress - Optional callback for progress updates
 * @returns Analysis result with all detected signals
 */
export async function analyzeTranscriptForInnocence(
  transcriptId: string,
  onProgress?: (progress: AnalysisProgress) => void
): Promise<AnalysisResult> {
  try {
    // Check if Gemini API is available
    const modelInfo = getModelInfo();
    if (!modelInfo.available) {
      return {
        success: false,
        transcriptId,
        explicitClaims: [],
        implicitSignals: [],
        contextualSignals: [],
        biasLanguage: [],
        innocenceScore: 0,
        error: 'Gemini API key not configured. Please set VITE_GEMINI_API_KEY environment variable.',
      };
    }

    // Fetch transcript from database
    const { data: transcript, error: fetchError } = await supabase
      .from('transcripts')
      .select('*')
      .eq('id', transcriptId)
      .single();

    if (fetchError || !transcript) {
      return {
        success: false,
        transcriptId,
        explicitClaims: [],
        implicitSignals: [],
        contextualSignals: [],
        biasLanguage: [],
        innocenceScore: 0,
        error: 'Transcript not found',
      };
    }

    onProgress?.({
      currentChunk: 0,
      totalChunks: 0,
      percentage: 0,
      status: 'Preprocessing transcript...',
    });

    // Preprocess: remove line numbers and normalize whitespace
    const cleanedText = preprocessTranscript(transcript.raw_text);

    onProgress?.({
      currentChunk: 0,
      totalChunks: 0,
      percentage: 5,
      status: 'Chunking transcript...',
    });

    // Chunk the preprocessed transcript
    const chunks = chunkTranscript(
      cleanedText,
      transcript.inmate_name,
      {
        maxTokens: 8000,
        contextTurns: 2,
        minInmateTurns: 1,
      }
    );

    if (chunks.length === 0) {
      // Run debug to help user understand why no speech was found
      console.error('No inmate speech found. Running diagnostics...');
      debugTranscriptSpeakers(cleanedText, transcript.inmate_name);

      return {
        success: false,
        transcriptId,
        explicitClaims: [],
        implicitSignals: [],
        contextualSignals: [],
        biasLanguage: [],
        innocenceScore: 0,
        error: 'No inmate speech found in transcript. Check browser console for diagnostic information.',
      };
    }

    onProgress?.({
      currentChunk: 0,
      totalChunks: chunks.length,
      percentage: 0,
      status: `Processing ${chunks.length} chunks...`,
    });

    // Analyze each chunk
    const allClaims: InnocenceClaim[] = [];
    const processedChunks = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];

      onProgress?.({
        currentChunk: i + 1,
        totalChunks: chunks.length,
        percentage: Math.round(((i + 1) / chunks.length) * 100),
        status: `Analyzing chunk ${i + 1} of ${chunks.length}...`,
      });

      // Create context summary from previous chunks
      const contextSummary = createContextSummary(processedChunks);

      // Analyze chunk with Gemini
      const claims = await analyzeChunkForInnocenceSignals(
        chunk.text,
        contextSummary
      );

      // Adjust claim indices to match full transcript positions
      const adjustedClaims = claims.map(claim => ({
        ...claim,
        start_index: claim.start_index + chunk.startIndex,
        end_index: claim.end_index + chunk.startIndex,
      }));

      allClaims.push(...adjustedClaims);
      processedChunks.push(chunk);

      // Small delay to avoid rate limiting
      if (i < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    onProgress?.({
      currentChunk: chunks.length,
      totalChunks: chunks.length,
      percentage: 100,
      status: 'Aggregating results...',
    });

    // Categorize claims by signal type
    const explicitClaims = allClaims.filter(c => c.signal_type === 'explicit');
    const implicitSignals = allClaims.filter(c => c.signal_type === 'implicit');
    const contextualSignals = allClaims.filter(c => c.signal_type === 'contextual');
    const biasLanguage = allClaims.filter(c => c.signal_type === 'bias_language');

    // Calculate innocence score
    const innocenceScore = calculateInnocenceScore({
      explicitClaims,
      implicitSignals,
      contextualSignals,
      biasLanguage,
    });

    // Store results in database
    const { error: insertError } = await supabase
      .from('predictions')
      .insert({
        transcript_id: transcriptId,
        innocence_score: innocenceScore,
        explicit_claims: explicitClaims,
        implicit_signals: [...implicitSignals, ...contextualSignals, ...biasLanguage],
        model_version: `gemini-1.5-pro-${new Date().toISOString().split('T')[0]}`,
      });

    if (insertError) {
      console.error('Error storing prediction:', insertError);
    }

    // Mark transcript as processed
    await supabase
      .from('transcripts')
      .update({ processed: true })
      .eq('id', transcriptId);

    return {
      success: true,
      transcriptId,
      explicitClaims,
      implicitSignals,
      contextualSignals,
      biasLanguage,
      innocenceScore,
    };
  } catch (error) {
    console.error('Error analyzing transcript:', error);
    return {
      success: false,
      transcriptId,
      explicitClaims: [],
      implicitSignals: [],
      contextualSignals: [],
      biasLanguage: [],
      innocenceScore: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Calculate an overall innocence score based on detected signals
 *
 * Score is weighted as follows:
 * - Explicit claims: High weight (0.4)
 * - Contextual signals: Medium-high weight (0.3)
 * - Implicit signals: Medium weight (0.2)
 * - Bias language: Low weight (0.1)
 *
 * @param signals - All detected signals
 * @returns Innocence score between 0 and 1
 */
function calculateInnocenceScore(signals: {
  explicitClaims: InnocenceClaim[];
  implicitSignals: InnocenceClaim[];
  contextualSignals: InnocenceClaim[];
  biasLanguage: InnocenceClaim[];
}): number {
  const { explicitClaims, implicitSignals, contextualSignals, biasLanguage } = signals;

  // Calculate weighted average confidence for each type
  const explicitScore = calculateAverageConfidence(explicitClaims);
  const implicitScore = calculateAverageConfidence(implicitSignals);
  const contextualScore = calculateAverageConfidence(contextualSignals);
  const biasScore = calculateAverageConfidence(biasLanguage);

  // Apply weights
  const weightedScore =
    explicitScore * 0.4 +
    contextualScore * 0.3 +
    implicitScore * 0.2 +
    biasScore * 0.1;

  // Round to 2 decimal places
  return Math.round(weightedScore * 100) / 100;
}

/**
 * Calculate average confidence from claims
 */
function calculateAverageConfidence(claims: InnocenceClaim[]): number {
  if (claims.length === 0) return 0;

  const sum = claims.reduce((acc, claim) => acc + claim.confidence, 0);
  return sum / claims.length;
}

/**
 * Get analysis results for a transcript
 *
 * @param transcriptId - ID of the transcript
 * @returns Existing analysis results or null
 */
export async function getAnalysisResults(
  transcriptId: string
): Promise<AnalysisResult | null> {
  const { data: prediction, error } = await supabase
    .from('predictions')
    .select('*')
    .eq('transcript_id', transcriptId)
    .order('analyzed_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !prediction) {
    return null;
  }

  const explicitClaims = Array.isArray(prediction.explicit_claims)
    ? prediction.explicit_claims
    : [];
  const allImplicitSignals = Array.isArray(prediction.implicit_signals)
    ? prediction.implicit_signals
    : [];

  // Separate implicit signals by type
  const implicitSignals = allImplicitSignals.filter(
    (s: InnocenceClaim) => s.signal_type === 'implicit'
  );
  const contextualSignals = allImplicitSignals.filter(
    (s: InnocenceClaim) => s.signal_type === 'contextual'
  );
  const biasLanguage = allImplicitSignals.filter(
    (s: InnocenceClaim) => s.signal_type === 'bias_language'
  );

  return {
    success: true,
    transcriptId,
    explicitClaims,
    implicitSignals,
    contextualSignals,
    biasLanguage,
    innocenceScore: prediction.innocence_score || 0,
  };
}

/**
 * Batch analyze multiple transcripts
 *
 * @param transcriptIds - Array of transcript IDs to analyze
 * @param onProgress - Optional progress callback
 * @returns Array of analysis results
 */
export async function batchAnalyzeTranscripts(
  transcriptIds: string[],
  onProgress?: (completed: number, total: number) => void
): Promise<AnalysisResult[]> {
  const results: AnalysisResult[] = [];

  for (let i = 0; i < transcriptIds.length; i++) {
    const result = await analyzeTranscriptForInnocence(transcriptIds[i]);
    results.push(result);

    onProgress?.(i + 1, transcriptIds.length);

    // Delay between transcripts to avoid rate limiting
    if (i < transcriptIds.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  return results;
}

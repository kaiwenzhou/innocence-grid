import type { SpeakerTurn, TranscriptChunk } from '@/lib/types';
import { parseTranscriptSpeakers } from './speakerParser';

/**
 * Transcript Chunker Utility
 *
 * Intelligently chunks transcripts for LLM processing while:
 * - Preserving complete inmate speech blocks
 * - Maintaining context around inmate statements
 * - Staying within token limits
 */

/**
 * Configuration for chunking
 */
interface ChunkingConfig {
  /** Maximum tokens per chunk (approximate, based on ~4 chars per token) */
  maxTokens: number;
  /** Number of context turns to include before/after inmate speech */
  contextTurns: number;
  /** Minimum number of inmate turns to include in a chunk */
  minInmateTurns: number;
}

const DEFAULT_CONFIG: ChunkingConfig = {
  maxTokens: 8000, // ~32,000 characters
  contextTurns: 2, // Include 2 turns before and after
  minInmateTurns: 1,
};

/**
 * Chunk a transcript intelligently, preserving inmate speech blocks
 *
 * Strategy:
 * 1. Parse transcript into speaker turns
 * 2. Identify all inmate turns
 * 3. Group inmate turns with surrounding context
 * 4. Create chunks that don't exceed token limit
 * 5. Ensure no inmate speech block is split mid-speech
 *
 * @param transcript - Raw transcript text
 * @param inmateName - Name of the inmate to identify their turns
 * @param config - Optional chunking configuration
 * @returns Array of transcript chunks
 */
export function chunkTranscript(
  transcript: string,
  inmateName?: string | null,
  config: Partial<ChunkingConfig> = {}
): TranscriptChunk[] {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  const maxChars = fullConfig.maxTokens * 4; // Approximate chars per token

  // Parse transcript into speaker turns
  const allTurns = parseTranscriptSpeakers(transcript, inmateName);

  if (allTurns.length === 0) {
    return [];
  }

  // Find all inmate turn indices
  const inmateTurnIndices = allTurns
    .map((turn, index) => (turn.speaker === 'INMATE' ? index : -1))
    .filter(index => index !== -1);

  if (inmateTurnIndices.length === 0) {
    // No inmate turns found, return empty chunks
    // or optionally return the whole transcript as one chunk
    return [];
  }

  // Group inmate turns into chunks with context
  const chunks: TranscriptChunk[] = [];
  let currentChunkIndices: number[] = [];
  let currentChunkSize = 0;

  for (let i = 0; i < inmateTurnIndices.length; i++) {
    const inmateTurnIndex = inmateTurnIndices[i];

    // Calculate range with context
    const startIndex = Math.max(0, inmateTurnIndex - fullConfig.contextTurns);
    const endIndex = Math.min(
      allTurns.length - 1,
      inmateTurnIndex + fullConfig.contextTurns
    );

    // Get all turn indices in this range
    const rangeIndices: number[] = [];
    for (let j = startIndex; j <= endIndex; j++) {
      rangeIndices.push(j);
    }

    // Calculate size of this range
    const rangeSize = rangeIndices.reduce((sum, idx) => {
      return sum + allTurns[idx].text.length;
    }, 0);

    // Check if adding this range would exceed max size
    if (currentChunkSize + rangeSize > maxChars && currentChunkIndices.length > 0) {
      // Create chunk from current indices
      chunks.push(createChunkFromIndices(allTurns, currentChunkIndices, transcript));
      currentChunkIndices = [];
      currentChunkSize = 0;
    }

    // Add range indices to current chunk (avoiding duplicates)
    for (const idx of rangeIndices) {
      if (!currentChunkIndices.includes(idx)) {
        currentChunkIndices.push(idx);
        currentChunkSize += allTurns[idx].text.length;
      }
    }
  }

  // Add remaining chunk
  if (currentChunkIndices.length > 0) {
    chunks.push(createChunkFromIndices(allTurns, currentChunkIndices, transcript));
  }

  return chunks;
}

/**
 * Create a chunk from a list of turn indices
 */
function createChunkFromIndices(
  allTurns: SpeakerTurn[],
  indices: number[],
  fullTranscript: string
): TranscriptChunk {
  // Sort indices to maintain order
  indices.sort((a, b) => a - b);

  const turns = indices.map(i => allTurns[i]);
  const startIndex = turns[0].startIndex;
  const endIndex = turns[turns.length - 1].endIndex;
  const text = fullTranscript.slice(startIndex, endIndex);

  return {
    turns,
    text,
    startIndex,
    endIndex,
  };
}

/**
 * Get summary of chunk for context passing
 *
 * Creates a brief summary of what happened in previous chunks
 * to maintain context across chunk boundaries.
 *
 * @param chunk - The chunk to summarize
 * @returns Summary string
 */
export function getChunkSummary(chunk: TranscriptChunk): string {
  const inmateTurns = chunk.turns.filter(t => t.speaker === 'INMATE');

  if (inmateTurns.length === 0) {
    return 'No inmate statements in this section.';
  }

  // Create a brief summary mentioning key speakers and topics
  const speakers = new Set(chunk.turns.map(t => t.speaker));
  const speakerList = Array.from(speakers).join(', ');

  return `Previous section included ${inmateTurns.length} inmate statement(s) with speakers: ${speakerList}.`;
}

/**
 * Extract only inmate speech from chunks
 *
 * Useful for focused analysis on just what the inmate said.
 *
 * @param chunks - Array of transcript chunks
 * @returns Array of inmate-only text segments
 */
export function extractInmateSpeechFromChunks(chunks: TranscriptChunk[]): string[] {
  const inmateTexts: string[] = [];

  for (const chunk of chunks) {
    const inmateTurns = chunk.turns.filter(t => t.speaker === 'INMATE');
    for (const turn of inmateTurns) {
      inmateTexts.push(turn.text);
    }
  }

  return inmateTexts;
}

/**
 * Create context summary from previous chunks
 *
 * @param previousChunks - Array of previous chunks
 * @param maxSummaryLength - Maximum length of summary
 * @returns Context summary string
 */
export function createContextSummary(
  previousChunks: TranscriptChunk[],
  maxSummaryLength = 500
): string {
  if (previousChunks.length === 0) {
    return '';
  }

  const summaries = previousChunks.map(getChunkSummary);
  let fullSummary = summaries.join(' ');

  // Truncate if too long
  if (fullSummary.length > maxSummaryLength) {
    fullSummary = fullSummary.slice(0, maxSummaryLength) + '...';
  }

  return `Context from previous sections: ${fullSummary}`;
}

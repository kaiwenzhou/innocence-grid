import type { SpeakerTurn } from '@/lib/types';

/**
 * Speaker Parser Utility
 *
 * Parses court transcripts into speaker turns.
 * Handles various speaker formats commonly found in court transcripts.
 */

/**
 * Common speaker patterns in court transcripts:
 * - "THE COURT:" or "THE PRESIDING MEMBER:"
 * - "DEFENDANT:" or "INMATE [NAME]:"
 * - "ATTORNEY [NAME]:" or "DEFENSE ATTORNEY:"
 * - "PROSECUTOR:" or "DISTRICT ATTORNEY:"
 * - "WITNESS [NAME]:"
 * - All caps speaker name followed by colon
 */
const SPEAKER_PATTERN = /^([A-Z][A-Z\s\.\-,]+?):\s*/gm;

/**
 * Alternative pattern for speakers with parenthetical descriptions
 * Example: "MR. SMITH (Defense Attorney):"
 */
const SPEAKER_WITH_DESC_PATTERN = /^([A-Z][A-Z\s\.\-,]+?(?:\([^)]+\))??):\s*/gm;

/**
 * Parse a transcript into speaker turns
 *
 * @param transcript - Raw transcript text
 * @param inmateName - Optional inmate name to identify inmate turns
 * @returns Array of speaker turns with speaker identification and text
 */
export function parseTranscriptSpeakers(
  transcript: string,
  inmateName?: string | null
): SpeakerTurn[] {
  const turns: SpeakerTurn[] = [];

  // Find all speaker markers in the text
  const matches = [...transcript.matchAll(SPEAKER_PATTERN)];

  if (matches.length === 0) {
    // If no speakers found, treat entire transcript as unknown speaker
    return [{
      speaker: 'UNKNOWN',
      text: transcript,
      startIndex: 0,
      endIndex: transcript.length
    }];
  }

  // Process each speaker turn
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const nextMatch = matches[i + 1];

    const speaker = match[1].trim();
    const startIndex = match.index! + match[0].length;
    const endIndex = nextMatch ? nextMatch.index! : transcript.length;

    const text = transcript.slice(startIndex, endIndex).trim();

    if (text.length > 0) {
      turns.push({
        speaker: normalizeSpeakerName(speaker, inmateName),
        text,
        startIndex,
        endIndex
      });
    }
  }

  return turns;
}

/**
 * Normalize speaker names to standard categories
 *
 * @param speaker - Raw speaker name from transcript
 * @param inmateName - Known inmate name for matching
 * @returns Normalized speaker category
 */
function normalizeSpeakerName(speaker: string, inmateName?: string | null): string {
  // Normalize for case-insensitive, space-insensitive comparison
  const normalize = (str: string) => str.toUpperCase().replace(/\s+/g, ' ').trim();

  const normalizedSpeaker = normalize(speaker);

  // Check if this is the inmate by name
  if (inmateName) {
    const normalizedInmateName = normalize(inmateName);

    // Check exact match or if one contains the other
    if (normalizedSpeaker === normalizedInmateName ||
        normalizedSpeaker.includes(normalizedInmateName) ||
        normalizedInmateName.includes(normalizedSpeaker)) {
      return 'INMATE';
    }
  }

  // Common speaker patterns for inmates
  if (normalizedSpeaker.includes('DEFENDANT') ||
      normalizedSpeaker.includes('INMATE') ||
      normalizedSpeaker.includes('INCARCERATED PERSON') ||
      normalizedSpeaker.includes('PRISONER')) {
    return 'INMATE';
  }

  // Court officials (judges, commissioners, etc.)
  if (normalizedSpeaker.includes('COURT') ||
      normalizedSpeaker.includes('PRESIDING') ||
      normalizedSpeaker.includes('COMMISSIONER') ||
      normalizedSpeaker.includes('JUDGE')) {
    return 'COURT';
  }

  if (normalizedSpeaker.includes('DEFENSE') || normalizedSpeaker.includes('ATTORNEY') || normalizedSpeaker.includes('COUNSEL')) {
    return 'ATTORNEY';
  }

  if (normalizedSpeaker.includes('PROSECUTOR') || normalizedSpeaker.includes('DISTRICT ATTORNEY') || normalizedSpeaker.includes('D.A.')) {
    return 'PROSECUTOR';
  }

  if (normalizedSpeaker.includes('WITNESS')) {
    return 'WITNESS';
  }

  // Return original if no match
  return speaker;
}

/**
 * Filter speaker turns to get only inmate speech
 *
 * @param turns - Array of all speaker turns
 * @returns Array of turns where speaker is the inmate
 */
export function filterInmateTurns(turns: SpeakerTurn[]): SpeakerTurn[] {
  return turns.filter(turn => turn.speaker === 'INMATE');
}

/**
 * Get continuous blocks of inmate speech
 * Groups consecutive inmate turns together
 *
 * @param turns - Array of all speaker turns
 * @returns Array of inmate speech blocks
 */
export function getInmateSpeechBlocks(turns: SpeakerTurn[]): SpeakerTurn[][] {
  const blocks: SpeakerTurn[][] = [];
  let currentBlock: SpeakerTurn[] = [];

  for (const turn of turns) {
    if (turn.speaker === 'INMATE') {
      currentBlock.push(turn);
    } else {
      if (currentBlock.length > 0) {
        blocks.push(currentBlock);
        currentBlock = [];
      }
    }
  }

  // Add last block if exists
  if (currentBlock.length > 0) {
    blocks.push(currentBlock);
  }

  return blocks;
}

/**
 * Check if a position in the transcript is within an inmate turn
 *
 * @param position - Character position in transcript
 * @param inmateTurns - Array of inmate turns
 * @returns true if position is within an inmate turn
 */
export function isWithinInmateTurn(position: number, inmateTurns: SpeakerTurn[]): boolean {
  return inmateTurns.some(turn =>
    position >= turn.startIndex && position <= turn.endIndex
  );
}

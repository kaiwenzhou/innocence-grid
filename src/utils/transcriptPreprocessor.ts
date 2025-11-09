/**
 * Transcript Preprocessing Utilities
 *
 * Clean and normalize transcript text before analysis
 */

/**
 * Remove line numbers from transcript text
 *
 * Many court transcripts have line numbers at the start of each line:
 * "1  SPEAKER: text here"
 * "2  more text"
 *
 * This removes them to get clean text for analysis.
 *
 * @param transcript - Raw transcript text with line numbers
 * @returns Cleaned transcript without line numbers
 */
export function removeLineNumbers(transcript: string): string {
  // Pattern: Line starts with optional spaces, digits, then more spaces
  // Replace with empty string to remove the numbering
  return transcript.replace(/^[ \t]*\d+[ \t]+/gm, '');
}

/**
 * Normalize whitespace in transcript
 * - Collapse multiple spaces to single space
 * - Keep paragraph breaks (double newlines)
 *
 * @param transcript - Transcript text
 * @returns Normalized transcript
 */
export function normalizeWhitespace(transcript: string): string {
  // Split by paragraph breaks
  const paragraphs = transcript.split(/\n\n+/);

  // Normalize each paragraph
  const normalized = paragraphs.map(para => {
    // Collapse multiple spaces within lines
    return para.replace(/[ \t]+/g, ' ').trim();
  });

  // Rejoin with double newlines
  return normalized.join('\n\n');
}

/**
 * Full preprocessing pipeline
 * Applies all cleaning steps to prepare transcript for analysis
 *
 * @param transcript - Raw transcript text
 * @returns Cleaned and normalized transcript
 */
export function preprocessTranscript(transcript: string): string {
  let cleaned = transcript;

  // Step 1: Remove line numbers
  cleaned = removeLineNumbers(cleaned);

  // Step 2: Normalize whitespace
  cleaned = normalizeWhitespace(cleaned);

  return cleaned;
}

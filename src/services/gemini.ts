import { GoogleGenerativeAI } from '@google/generative-ai';
import type { InnocenceClaim } from '@/lib/types';

/**
 * Gemini API Service
 *
 * Handles communication with Google's Gemini API for
 * analyzing court transcripts and detecting innocence signals.
 */

// Get API key from environment
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.warn('VITE_GEMINI_API_KEY not found in environment variables');
}

// Initialize Gemini client
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

/**
 * System prompt for innocence signal detection
 */
const INNOCENCE_DETECTION_PROMPT = `You are an expert legal analyst specialized in detecting innocence claims in court transcripts.

Your task is to analyze inmate statements and identify any signals suggesting innocence claims.

## Signal Types to Detect:

1. **Explicit Signals**: Direct statements of innocence
   - Examples: "I did not commit this crime", "I'm innocent", "I didn't do it"

2. **Implicit Signals**: Maintained innocence despite negative outcomes
   - Examples: Refusing plea deals, consistently maintaining innocence over time, accepting harsher sentences rather than admit guilt

3. **Contextual Signals**: Evidence of problematic case circumstances
   - Examples: Mentions of coerced confessions, recantations, witness recantations, evidence gaps, alibi evidence, prosecutorial misconduct

4. **Bias Language**: Institutional language suggesting bias against maintaining innocence
   - Examples: "lack of insight", "failure to take responsibility", "minimization", "denial"

## Output Format:

Return a JSON array of innocence claims. Each claim must have:
- "text": The exact quote from the inmate (word-for-word)
- "signal_type": One of: "explicit", "implicit", "contextual", "bias_language"
- "confidence": A number between 0 and 1 indicating confidence in this classification
- "explanation": A brief explanation of why this is classified as this signal type

## Important Rules:

1. Only include text SPOKEN BY THE INMATE (not by judges, attorneys, or others)
2. Quote the inmate's words as accurately as possible - clean up minor stutters, filler words, or formatting issues for readability
3. Be inclusive - flag anything that could suggest innocence, even if subtle
4. Each claim should capture the meaningful statement
5. If no innocence signals are found, return an empty array

Return ONLY valid JSON, no additional text or explanation.`;

/**
 * Analyze a transcript chunk for innocence signals
 *
 * @param chunkText - Text of the transcript chunk to analyze
 * @param contextSummary - Optional summary of previous chunks for context
 * @returns Array of detected innocence claims
 */
export async function analyzeChunkForInnocenceSignals(
  chunkText: string,
  contextSummary?: string
): Promise<InnocenceClaim[]> {
  if (!genAI) {
    console.error('Gemini API not initialized. Please set VITE_GEMINI_API_KEY');
    return [];
  }

  try {
    // Use Gemini 2.0 Flash Lite for analysis
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

    // Build the prompt
    let prompt = INNOCENCE_DETECTION_PROMPT + '\n\n';

    if (contextSummary) {
      prompt += `## Context from Previous Sections:\n${contextSummary}\n\n`;
    }

    prompt += `## Transcript Section to Analyze:\n\n${chunkText}\n\n`;
    prompt += `## Your Analysis (JSON only):`;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse the JSON response
    const claims = parseGeminiResponse(text, chunkText);

    return claims;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return [];
  }
}

/**
 * Parse Gemini's response and validate the claims
 *
 * @param responseText - Raw response from Gemini
 * @param chunkText - Original chunk text for validation
 * @returns Validated array of innocence claims
 */
function parseGeminiResponse(responseText: string, chunkText: string): InnocenceClaim[] {
  try {
    // Extract JSON from response (handle markdown code blocks)
    let jsonText = responseText.trim();

    // Remove markdown code blocks if present
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    // Parse JSON
    const parsed = JSON.parse(jsonText);

    // Validate structure
    if (!Array.isArray(parsed)) {
      console.error('Response is not an array:', parsed);
      return [];
    }

    // Validate and enhance each claim
    const validatedClaims: InnocenceClaim[] = [];

    for (const claim of parsed) {
      // Validate required fields
      if (!claim.text || !claim.signal_type || typeof claim.confidence !== 'number') {
        console.warn('Invalid claim structure:', claim);
        continue;
      }

      // Validate signal type
      const validSignalTypes = ['explicit', 'implicit', 'contextual', 'bias_language'];
      if (!validSignalTypes.includes(claim.signal_type)) {
        console.warn('Invalid signal type:', claim.signal_type);
        continue;
      }

      // Validate confidence range
      if (claim.confidence < 0 || claim.confidence > 1) {
        console.warn('Invalid confidence value:', claim.confidence);
        continue;
      }

      // Try to find text position in chunk (fuzzy matching)
      let startIndex = chunkText.indexOf(claim.text);
      let endIndex = startIndex >= 0 ? startIndex + claim.text.length : -1;

      // If exact match fails, try fuzzy matching
      if (startIndex === -1) {
        // Remove extra spaces, punctuation, etc. for comparison
        const normalizedClaim = claim.text.replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').toLowerCase();
        const normalizedChunk = chunkText.replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').toLowerCase();

        const fuzzyIndex = normalizedChunk.indexOf(normalizedClaim);

        if (fuzzyIndex !== -1) {
          // Found with fuzzy matching - use original claim text as-is
          startIndex = 0; // We don't have exact position, but that's okay
          endIndex = claim.text.length;
          console.log('Fuzzy match found for:', claim.text.substring(0, 50) + '...');
        } else {
          // Still not found - but let's keep it anyway with warning
          console.warn('Claim not found in chunk (keeping anyway):', claim.text.substring(0, 50) + '...');
          startIndex = 0;
          endIndex = claim.text.length;
        }
      }

      validatedClaims.push({
        text: claim.text,
        signal_type: claim.signal_type,
        confidence: claim.confidence,
        start_index: startIndex,
        end_index: endIndex,
        explanation: claim.explanation || '',
      });
    }

    return validatedClaims;
  } catch (error) {
    console.error('Error parsing Gemini response:', error);
    console.error('Response text:', responseText);
    return [];
  }
}

/**
 * Test the Gemini API connection
 *
 * @returns true if API is working, false otherwise
 */
export async function testGeminiConnection(): Promise<boolean> {
  if (!genAI) {
    return false;
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
    const result = await model.generateContent('Hello, respond with "OK" if you can hear me.');
    const response = result.response;
    return response.text().includes('OK');
  } catch (error) {
    console.error('Gemini connection test failed:', error);
    return false;
  }
}

/**
 * Get model information
 */
export function getModelInfo(): { available: boolean; model: string } {
  return {
    available: !!genAI,
    model: 'gemini-2.0-flash-lite',
  };
}

/**
 * Example Usage: Innocence Signal Detection
 *
 * This file demonstrates how to use the innocence detection system
 * to analyze court transcripts for potential innocence claims.
 */

import {
  analyzeTranscriptForInnocence,
  getAnalysisResults,
  batchAnalyzeTranscripts,
} from '../src/services/innocenceDetector';
import { parseTranscriptSpeakers, filterInmateTurns } from '../src/utils/speakerParser';
import { chunkTranscript } from '../src/utils/transcriptChunker';
import { testGeminiConnection } from '../src/services/gemini';

/**
 * Example 1: Test Gemini API Connection
 */
export async function exampleTestConnection() {
  console.log('Testing Gemini API connection...');

  const isConnected = await testGeminiConnection();

  if (isConnected) {
    console.log('✓ Gemini API is connected and working!');
  } else {
    console.log('✗ Gemini API connection failed. Check your API key.');
  }
}

/**
 * Example 2: Parse Speaker Turns
 */
export function exampleParseSpeakers() {
  const sampleTranscript = `
THE COURT: Good morning. Please state your name for the record.

INMATE: My name is John Doe. I want to be clear - I did not commit this crime.

THE COURT: The evidence suggests otherwise.

INMATE: I understand that's what it looks like, but I was not there. I have an alibi.
         My family can verify I was at home that night.

DEFENSE ATTORNEY: Your honor, we have submitted alibi evidence.

THE COURT: We'll review that evidence. Continue.
  `;

  console.log('Parsing speaker turns...\n');

  const turns = parseTranscriptSpeakers(sampleTranscript, 'JOHN DOE');
  const inmateTurns = filterInmateTurns(turns);

  console.log(`Found ${turns.length} total speaker turns`);
  console.log(`Found ${inmateTurns.length} inmate turns:\n`);

  inmateTurns.forEach((turn, i) => {
    console.log(`Inmate Statement ${i + 1}:`);
    console.log(`"${turn.text}"\n`);
  });
}

/**
 * Example 3: Chunk a Transcript
 */
export function exampleChunking() {
  const sampleTranscript = `
THE COURT: Good morning. Please state your name for the record.

INMATE: My name is John Doe.

THE COURT: You are here for a parole hearing. Do you have anything to say?

INMATE: Yes, your honor. I want to make it clear that I maintain my innocence.
        I did not commit this crime. I accepted a plea deal because I was told
        I would face life in prison otherwise, but I never actually did what
        they accused me of.

ATTORNEY: Your honor, my client has consistently maintained his innocence.

THE COURT: The record shows you pled guilty.

INMATE: I know what the record says, but I was coerced. The detective told me
        they had evidence they didn't actually have. I was scared and took the deal.
        But I didn't do it.
  `.repeat(10); // Repeat to make it longer for chunking

  console.log('Chunking transcript...\n');

  const chunks = chunkTranscript(sampleTranscript, 'JOHN DOE', {
    maxTokens: 1000, // Small chunks for this example
    contextTurns: 1,
  });

  console.log(`Created ${chunks.length} chunks\n`);

  chunks.forEach((chunk, i) => {
    console.log(`Chunk ${i + 1}:`);
    console.log(`- ${chunk.turns.length} speaker turns`);
    console.log(`- ${chunk.text.length} characters`);
    console.log(`- Starts at index ${chunk.startIndex}\n`);
  });
}

/**
 * Example 4: Analyze a Single Transcript
 */
export async function exampleAnalyzeSingle(transcriptId: string) {
  console.log(`Analyzing transcript ${transcriptId}...\n`);

  const result = await analyzeTranscriptForInnocence(
    transcriptId,
    (progress) => {
      console.log(
        `[${progress.percentage}%] ${progress.status} ` +
        `(Chunk ${progress.currentChunk}/${progress.totalChunks})`
      );
    }
  );

  if (!result.success) {
    console.error('Analysis failed:', result.error);
    return;
  }

  console.log('\n=== Analysis Results ===\n');
  console.log(`Innocence Score: ${result.innocenceScore}\n`);

  console.log(`Explicit Claims (${result.explicitClaims.length}):`);
  result.explicitClaims.forEach((claim, i) => {
    console.log(`  ${i + 1}. "${claim.text}"`);
    console.log(`     Confidence: ${claim.confidence}`);
    console.log(`     Explanation: ${claim.explanation}\n`);
  });

  console.log(`Implicit Signals (${result.implicitSignals.length}):`);
  result.implicitSignals.forEach((claim, i) => {
    console.log(`  ${i + 1}. "${claim.text}"`);
    console.log(`     Confidence: ${claim.confidence}\n`);
  });

  console.log(`Contextual Signals (${result.contextualSignals.length}):`);
  result.contextualSignals.forEach((claim, i) => {
    console.log(`  ${i + 1}. "${claim.text}"`);
    console.log(`     Confidence: ${claim.confidence}\n`);
  });

  console.log(`Bias Language (${result.biasLanguage.length}):`);
  result.biasLanguage.forEach((claim, i) => {
    console.log(`  ${i + 1}. "${claim.text}"`);
    console.log(`     Confidence: ${claim.confidence}\n`);
  });
}

/**
 * Example 5: Retrieve Existing Analysis
 */
export async function exampleRetrieveResults(transcriptId: string) {
  console.log(`Retrieving existing analysis for ${transcriptId}...\n`);

  const results = await getAnalysisResults(transcriptId);

  if (!results) {
    console.log('No existing analysis found for this transcript.');
    return;
  }

  console.log('Found existing analysis:');
  console.log(`- Innocence Score: ${results.innocenceScore}`);
  console.log(`- Explicit Claims: ${results.explicitClaims.length}`);
  console.log(`- Implicit Signals: ${results.implicitSignals.length}`);
  console.log(`- Contextual Signals: ${results.contextualSignals.length}`);
  console.log(`- Bias Language: ${results.biasLanguage.length}`);
}

/**
 * Example 6: Batch Analysis
 */
export async function exampleBatchAnalysis(transcriptIds: string[]) {
  console.log(`Batch analyzing ${transcriptIds.length} transcripts...\n`);

  const results = await batchAnalyzeTranscripts(
    transcriptIds,
    (completed, total) => {
      console.log(`Progress: ${completed}/${total} transcripts completed`);
    }
  );

  console.log('\n=== Batch Analysis Summary ===\n');

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`Successful: ${successful.length}`);
  console.log(`Failed: ${failed.length}\n`);

  if (successful.length > 0) {
    console.log('Average innocence score:',
      (successful.reduce((sum, r) => sum + r.innocenceScore, 0) / successful.length).toFixed(2)
    );

    console.log('\nTop 3 by innocence score:');
    successful
      .sort((a, b) => b.innocenceScore - a.innocenceScore)
      .slice(0, 3)
      .forEach((result, i) => {
        console.log(`  ${i + 1}. Transcript ${result.transcriptId}: ${result.innocenceScore}`);
      });
  }

  if (failed.length > 0) {
    console.log('\nFailed transcripts:');
    failed.forEach(result => {
      console.log(`  - ${result.transcriptId}: ${result.error}`);
    });
  }
}

/**
 * Example 7: Detailed Analysis Report
 */
export async function exampleDetailedReport(transcriptId: string) {
  const result = await analyzeTranscriptForInnocence(transcriptId);

  if (!result.success) {
    console.error('Analysis failed:', result.error);
    return;
  }

  console.log('\n' + '='.repeat(80));
  console.log('INNOCENCE SIGNAL DETECTION REPORT');
  console.log('='.repeat(80) + '\n');

  console.log(`Transcript ID: ${result.transcriptId}`);
  console.log(`Overall Innocence Score: ${result.innocenceScore} / 1.00`);
  console.log(`Score Interpretation: ${interpretScore(result.innocenceScore)}\n`);

  console.log('='.repeat(80));
  console.log('DETAILED FINDINGS');
  console.log('='.repeat(80) + '\n');

  const allSignals = [
    ...result.explicitClaims,
    ...result.implicitSignals,
    ...result.contextualSignals,
    ...result.biasLanguage,
  ].sort((a, b) => b.confidence - a.confidence);

  allSignals.forEach((signal, i) => {
    console.log(`${i + 1}. [${signal.signal_type.toUpperCase()}] (Confidence: ${signal.confidence})`);
    console.log(`   Quote: "${signal.text}"`);
    if (signal.explanation) {
      console.log(`   Analysis: ${signal.explanation}`);
    }
    console.log('');
  });

  console.log('='.repeat(80));
  console.log('SUMMARY BY SIGNAL TYPE');
  console.log('='.repeat(80) + '\n');

  const summary = {
    'Explicit Claims': result.explicitClaims.length,
    'Implicit Signals': result.implicitSignals.length,
    'Contextual Signals': result.contextualSignals.length,
    'Bias Language': result.biasLanguage.length,
  };

  Object.entries(summary).forEach(([type, count]) => {
    console.log(`${type}: ${count}`);
  });

  console.log('\n' + '='.repeat(80) + '\n');
}

/**
 * Helper: Interpret innocence score
 */
function interpretScore(score: number): string {
  if (score >= 0.8) return 'Very High - Strong innocence signals detected';
  if (score >= 0.6) return 'High - Multiple innocence signals detected';
  if (score >= 0.4) return 'Moderate - Some innocence signals detected';
  if (score >= 0.2) return 'Low - Few innocence signals detected';
  return 'Very Low - Minimal or no innocence signals detected';
}

/**
 * Run all examples (for demonstration purposes)
 */
export async function runAllExamples(transcriptId?: string) {
  console.log('Running all examples...\n');

  // Example 1: Test connection
  await exampleTestConnection();
  console.log('\n' + '-'.repeat(80) + '\n');

  // Example 2: Parse speakers
  exampleParseSpeakers();
  console.log('\n' + '-'.repeat(80) + '\n');

  // Example 3: Chunking
  exampleChunking();
  console.log('\n' + '-'.repeat(80) + '\n');

  // If transcript ID provided, run analysis examples
  if (transcriptId) {
    // Example 4: Analyze single
    await exampleAnalyzeSingle(transcriptId);
    console.log('\n' + '-'.repeat(80) + '\n');

    // Example 5: Retrieve results
    await exampleRetrieveResults(transcriptId);
    console.log('\n' + '-'.repeat(80) + '\n');

    // Example 7: Detailed report
    await exampleDetailedReport(transcriptId);
  }

  console.log('All examples completed!');
}

// Uncomment to run examples:
// runAllExamples('your-transcript-id-here');

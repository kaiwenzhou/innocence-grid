/**
 * Debug utilities for transcript parsing
 */

import { parseTranscriptSpeakers } from './speakerParser';

/**
 * Analyze a transcript and show what speakers were detected
 */
export function debugTranscriptSpeakers(transcript: string, inmateName?: string | null) {
  console.log('=== TRANSCRIPT DEBUG ===');
  console.log(`Transcript length: ${transcript.length} characters`);
  console.log(`Inmate name provided: ${inmateName || 'NONE'}`);
  console.log('');

  // Try to parse speakers
  const turns = parseTranscriptSpeakers(transcript, inmateName);

  console.log(`Total speaker turns found: ${turns.length}`);

  if (turns.length === 0) {
    console.log('');
    console.log('⚠️ NO SPEAKERS FOUND!');
    console.log('');
    console.log('Transcript preview (first 500 chars):');
    console.log(transcript.slice(0, 500));
    console.log('');
    console.log('Expected format:');
    console.log('SPEAKER NAME: text here');
    console.log('ANOTHER SPEAKER: more text');
    return;
  }

  // Count by speaker type
  const speakerCounts = new Map<string, number>();
  for (const turn of turns) {
    speakerCounts.set(turn.speaker, (speakerCounts.get(turn.speaker) || 0) + 1);
  }

  console.log('');
  console.log('Speaker breakdown:');
  for (const [speaker, count] of speakerCounts.entries()) {
    console.log(`  ${speaker}: ${count} turns`);
  }

  const inmateTurns = turns.filter(t => t.speaker === 'INMATE');
  console.log('');
  console.log(`✓ Inmate turns found: ${inmateTurns.length}`);

  if (inmateTurns.length === 0) {
    console.log('');
    console.log('⚠️ NO INMATE SPEECH DETECTED!');
    console.log('');
    console.log('All raw speaker names found:');
    const rawPattern = /^([A-Z][A-Z\s\.\-,]+?):\s*/gm;
    const matches = [...transcript.matchAll(rawPattern)];
    matches.slice(0, 10).forEach(m => {
      console.log(`  - "${m[1]}"`);
    });
    if (matches.length > 10) {
      console.log(`  ... and ${matches.length - 10} more`);
    }
  } else {
    console.log('');
    console.log('Sample inmate speech (first 3):');
    inmateTurns.slice(0, 3).forEach((turn, i) => {
      console.log(`  ${i + 1}. "${turn.text.slice(0, 100)}${turn.text.length > 100 ? '...' : ''}"`);
    });
  }

  console.log('');
  console.log('=== END DEBUG ===');
}

/**
 * Test different speaker patterns on a transcript sample
 */
export function testSpeakerPatterns(sample: string) {
  console.log('Testing speaker patterns on sample:');
  console.log(sample.slice(0, 200));
  console.log('');

  const patterns = [
    { name: 'Standard (NAME:)', pattern: /^([A-Z][A-Z\s\.\-,]+?):\s*/gm },
    { name: 'With periods (MR. NAME:)', pattern: /^([A-Z][A-Z\s\.\-,]+?(?:\([^)]+\))??):\s*/gm },
    { name: 'Lowercase start (Name:)', pattern: /^([A-Z][A-Za-z\s\.\-,]+?):\s*/gm },
  ];

  for (const { name, pattern } of patterns) {
    const matches = [...sample.matchAll(pattern)];
    console.log(`${name}: ${matches.length} matches`);
    matches.slice(0, 3).forEach(m => {
      console.log(`  - "${m[1]}"`);
    });
  }
}

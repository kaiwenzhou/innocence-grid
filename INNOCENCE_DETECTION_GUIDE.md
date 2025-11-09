# Innocence Signal Detection with Gemini API

This guide explains how to use the innocence signal detection system that analyzes court transcripts using Google's Gemini API.

## Overview

The system automatically:
1. **Parses transcripts** into speaker turns
2. **Chunks intelligently** to preserve complete inmate speech blocks
3. **Analyzes with AI** using Google Gemini to detect innocence signals
4. **Maintains context** across chunks for accurate analysis
5. **Stores results** in the database for review

## Signal Types Detected

### 1. Explicit Signals
Direct statements of innocence:
- "I did not commit this crime"
- "I'm innocent"
- "I didn't do it"

### 2. Implicit Signals
Maintained innocence despite negative outcomes:
- Refusing plea deals
- Consistently maintaining innocence over time
- Accepting harsher sentences rather than admit guilt

### 3. Contextual Signals
Evidence of problematic case circumstances:
- Mentions of coerced confessions
- Recantations
- Evidence gaps
- Alibi evidence
- Prosecutorial misconduct

### 4. Bias Language
Institutional language suggesting bias:
- "lack of insight"
- "failure to take responsibility"
- "minimization"
- "denial"

## Setup

### 1. Get a Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key

### 2. Configure Environment Variables

Create a `.env` file in the project root (copy from `.env.example`):

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

## Usage

### Basic Usage

```typescript
import { analyzeTranscriptForInnocence } from '@/services/innocenceDetector';

// Analyze a transcript
const result = await analyzeTranscriptForInnocence(transcriptId);

if (result.success) {
  console.log('Innocence Score:', result.innocenceScore);
  console.log('Explicit Claims:', result.explicitClaims);
  console.log('Implicit Signals:', result.implicitSignals);
  console.log('Contextual Signals:', result.contextualSignals);
  console.log('Bias Language:', result.biasLanguage);
}
```

### With Progress Tracking

```typescript
import { analyzeTranscriptForInnocence } from '@/services/innocenceDetector';

const result = await analyzeTranscriptForInnocence(
  transcriptId,
  (progress) => {
    console.log(`${progress.status} (${progress.percentage}%)`);
    console.log(`Chunk ${progress.currentChunk} of ${progress.totalChunks}`);
  }
);
```

### Batch Analysis

```typescript
import { batchAnalyzeTranscripts } from '@/services/innocenceDetector';

const transcriptIds = ['id1', 'id2', 'id3'];

const results = await batchAnalyzeTranscripts(
  transcriptIds,
  (completed, total) => {
    console.log(`Processed ${completed} of ${total} transcripts`);
  }
);
```

### Retrieve Existing Results

```typescript
import { getAnalysisResults } from '@/services/innocenceDetector';

const results = await getAnalysisResults(transcriptId);

if (results) {
  console.log('Previous analysis found:', results);
}
```

## Architecture

### Components

#### 1. Speaker Parser (`/src/utils/speakerParser.ts`)
- Parses transcripts into speaker turns
- Identifies inmates vs other speakers
- Groups consecutive inmate speech blocks

```typescript
import { parseTranscriptSpeakers, filterInmateTurns } from '@/utils/speakerParser';

const turns = parseTranscriptSpeakers(transcriptText, inmateName);
const inmateTurns = filterInmateTurns(turns);
```

#### 2. Transcript Chunker (`/src/utils/transcriptChunker.ts`)
- Intelligently chunks transcripts for LLM processing
- Preserves complete inmate speech blocks
- Maintains context around inmate statements
- Stays within token limits

```typescript
import { chunkTranscript, createContextSummary } from '@/utils/transcriptChunker';

const chunks = chunkTranscript(transcriptText, inmateName, {
  maxTokens: 8000,
  contextTurns: 2,
  minInmateTurns: 1,
});
```

#### 3. Gemini Service (`/src/services/gemini.ts`)
- Handles Gemini API communication
- Analyzes chunks for innocence signals
- Validates and parses AI responses

```typescript
import { analyzeChunkForInnocenceSignals } from '@/services/gemini';

const claims = await analyzeChunkForInnocenceSignals(chunkText, contextSummary);
```

#### 4. Innocence Detector (`/src/services/innocenceDetector.ts`)
- Main orchestration service
- Manages chunking, analysis, and result aggregation
- Calculates innocence scores
- Stores results in database

## Chunking Strategy

The chunking system uses an intelligent approach:

1. **Parse into speaker turns** - Identify who said what
2. **Identify inmate turns** - Find all statements by the inmate
3. **Add context** - Include surrounding turns for context
4. **Respect boundaries** - Never split an inmate's speech mid-sentence
5. **Manage size** - Stay within token limits (~8000 tokens per chunk)

### Example Chunk

```
Context (before):
THE COURT: Can you explain your actions on that day?

Inmate Speech (focus):
INMATE: I was not at the scene. I was at my sister's house in Oakland.
        I have witnesses who can confirm this. I never confessed to anything.

Context (after):
THE ATTORNEY: Do you have documentation of this alibi?
```

## Context Management

Context is maintained across chunks using summaries:

```typescript
// Previous chunk summary example
const summary = "Previous section included 3 inmate statements with speakers: COURT, INMATE, ATTORNEY.";

// This summary is passed to the next chunk analysis
const claims = await analyzeChunkForInnocenceSignals(nextChunkText, summary);
```

This ensures the AI understands:
- What has been discussed previously
- The flow of the conversation
- Patterns across multiple exchanges

## Innocence Score Calculation

The overall innocence score (0-1) is a weighted average:

- **Explicit claims**: 40% weight (most important)
- **Contextual signals**: 30% weight
- **Implicit signals**: 20% weight
- **Bias language**: 10% weight

```
Score = (explicit × 0.4) + (contextual × 0.3) + (implicit × 0.2) + (bias × 0.1)
```

## Data Structure

### InnocenceClaim

```typescript
interface InnocenceClaim {
  text: string;              // Exact quote from inmate
  signal_type: 'explicit' | 'implicit' | 'contextual' | 'bias_language';
  confidence: number;        // 0-1 confidence score
  start_index: number;       // Position in transcript
  end_index: number;         // End position in transcript
  explanation?: string;      // Why this was flagged
}
```

### Analysis Result

```typescript
interface AnalysisResult {
  success: boolean;
  transcriptId: string;
  explicitClaims: InnocenceClaim[];
  implicitSignals: InnocenceClaim[];
  contextualSignals: InnocenceClaim[];
  biasLanguage: InnocenceClaim[];
  innocenceScore: number;    // 0-1 overall score
  error?: string;
}
```

## Best Practices

### 1. Rate Limiting
- The system includes automatic delays between API calls (1s between chunks, 2s between transcripts)
- For batch processing, consider longer delays to stay within API limits

### 2. Error Handling
- Always check `result.success` before accessing results
- Handle API key missing gracefully
- Log errors for debugging

### 3. Cost Management
- Gemini 1.5 Pro pricing: ~$0.00125 per 1K input tokens
- A typical 50-page transcript costs ~$0.50-$1.00 to analyze
- Use batch processing during off-peak hours

### 4. Quality Assurance
- Review detected signals manually
- Adjust confidence thresholds as needed
- Provide feedback to improve prompts

## Example Integration in UI

```typescript
// In a React component
import { useState } from 'react';
import { analyzeTranscriptForInnocence } from '@/services/innocenceDetector';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

function AnalyzeButton({ transcriptId }: { transcriptId: string }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    setAnalyzing(true);

    const analysisResult = await analyzeTranscriptForInnocence(
      transcriptId,
      (prog) => {
        setProgress(prog.percentage);
      }
    );

    setResult(analysisResult);
    setAnalyzing(false);
  };

  return (
    <div>
      <Button onClick={handleAnalyze} disabled={analyzing}>
        {analyzing ? 'Analyzing...' : 'Analyze for Innocence'}
      </Button>

      {analyzing && <Progress value={progress} />}

      {result && result.success && (
        <div>
          <h3>Innocence Score: {result.innocenceScore}</h3>
          <p>Found {result.explicitClaims.length} explicit claims</p>
          <p>Found {result.implicitSignals.length} implicit signals</p>
        </div>
      )}
    </div>
  );
}
```

## Troubleshooting

### "Gemini API key not configured"
- Ensure `VITE_GEMINI_API_KEY` is set in your `.env` file
- Restart the development server after adding the key

### "No inmate speech found"
- Check if the transcript has proper speaker formatting
- Verify the inmate name is correctly extracted
- Review speaker patterns in `/src/utils/speakerParser.ts`

### "Rate limit exceeded"
- Reduce batch size
- Increase delays between API calls
- Check your Gemini API quota

### Low quality results
- Review the system prompt in `/src/services/gemini.ts`
- Adjust confidence thresholds
- Ensure transcripts have clear speaker attribution

## Future Enhancements

Potential improvements:
- [ ] Support for multiple AI models (Claude, GPT-4, etc.)
- [ ] Fine-tuned model for better accuracy
- [ ] Custom signal type definitions
- [ ] Real-time analysis as transcripts are uploaded
- [ ] Comparison across multiple transcripts
- [ ] Export reports with highlighted claims
- [ ] Human-in-the-loop review workflow

## Support

For issues or questions:
1. Check this documentation
2. Review code comments in service files
3. Check Gemini API documentation: https://ai.google.dev/docs
4. Open an issue in the repository

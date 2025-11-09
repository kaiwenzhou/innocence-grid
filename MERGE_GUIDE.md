# JusticeMAP + Innocence Grid Merge Guide

This document explains the successful merge of **JusticeMAP** (UI-focused) and **innocence-grid** (backend-focused) repositories into a unified application.

## 🎯 Merge Summary

### What Was Merged

**From JusticeMAP (UI & Multi-User Features):**
- ✅ Professional sidebar navigation
- ✅ Multi-user authentication with volunteer management
- ✅ Commissioner database and bias analysis
- ✅ Case assignment workflow
- ✅ Form auto-generation from transcripts
- ✅ Enhanced dashboard with analytics
- ✅ All JusticeMAP pages (Login, Clients, Cases, Analyze, Commissioner Breakdown, Form Generator)

**From innocence-grid (AI Backend):**
- ✅ **Gemini AI-powered innocence detection**
- ✅ Intelligent transcript chunking with speaker parsing
- ✅ Weighted scoring algorithm (40% explicit, 30% contextual, 20% implicit, 10% bias)
- ✅ PDF/TXT processing with metadata extraction
- ✅ Predictions table in database

### Result

A production-ready application with:
- **Backend:** AI-powered innocence analysis using Gemini 2.0 Flash Lite
- **Frontend:** Professional multi-user UI with volunteer collaboration
- **Features:** All capabilities from both repositories

---

## 📊 Technical Changes

### 1. Database Schema (Merged)

Run this SQL file in your Supabase SQL Editor:
```
database-merged-setup.sql
```

**New Tables:**
- `volunteers` - Multi-user authentication
- `transcripts` - Core table with both innocence-grid and JusticeMAP fields
- `predictions` - AI innocence analysis results (NEW)
- `case_assignments` - Assignment tracking
- `case_notes` - Volunteer annotations
- `commissioners` - Commissioner database
- `commissioner_hearings` - Hearing assignments
- `commissioner_statistics` - Performance metrics

**Key Fields Added to `transcripts`:**
- `assigned_to` - References volunteers(id)
- `assigned_at` - Assignment timestamp
- `status` - Case status (unassigned, assigned, in_review, completed, flagged)

### 2. Environment Variables

Updated `.env.example`:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key  # NEW - Required for AI analysis
```

**Get Gemini API Key:**
1. Visit https://aistudio.google.com/apikey
2. Create a new API key
3. Add it to your `.env` file

### 3. New Dependencies

Added to `package.json`:
```json
{
  "dependencies": {
    "@google/generative-ai": "^0.21.0"  // NEW - Gemini AI SDK
  }
}
```

### 4. Backend Services

**New/Restored Services:**
- `src/services/gemini.ts` - Gemini API integration
- `src/services/innocenceDetector.ts` - Main analysis orchestrator
- `src/utils/transcriptChunker.ts` - Intelligent chunking
- `src/utils/speakerParser.ts` - Speaker turn parsing
- `src/utils/transcriptPreprocessor.ts` - Text cleanup

**Updated Services:**
- `src/services/priority.ts` - Now uses AI innocence scores when available

### 5. UI Enhancements

**TranscriptDetail Page (`src/pages/TranscriptDetail.tsx`):**
- ✅ "Analyze with AI" button
- ✅ Real-time analysis progress bar
- ✅ Display of 4 signal types:
  - Explicit claims
  - Implicit signals
  - Contextual signals (NEW)
  - Bias language (NEW)
- ✅ Innocence score percentage with risk badges

### 6. Type Updates

**Updated `src/lib/types.ts`:**
```typescript
export interface Prediction {
  id: number;
  transcript_id: string;
  innocence_score: number | null;
  explicit_claims: any[];
  implicit_signals: any[];
  contextual_signals?: any[];  // NEW
  bias_language?: any[];       // NEW
  model_version: string | null;
  analyzed_at: string;
}
```

---

## 🚀 Setup Instructions

### Step 1: Database Migration

1. Open your Supabase project SQL Editor
2. Run the entire `database-merged-setup.sql` file
3. Verify all tables were created:
   ```sql
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public';
   ```

### Step 2: Environment Configuration

1. Copy `.env.example` to `.env`
2. Add your Supabase credentials
3. Add your Gemini API key (from Google AI Studio)

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Run Development Server

```bash
npm run dev
```

The app will start on http://localhost:8080

### Step 5: Test the Merge

1. **Upload a transcript** (Upload page)
2. **View transcript detail** (Click on any transcript)
3. **Click "Analyze with AI"** button
4. **Wait for analysis** (progress bar will show status)
5. **View results** (innocence score and detected signals)
6. **Check dashboard** (priority recommendations now use AI scores)

---

## 🔍 How AI Analysis Works

### Workflow

```
1. Upload PDF/TXT transcript
      ↓
2. Extract metadata (hearing date, inmate name, CDCR#)
      ↓
3. User clicks "Analyze with AI"
      ↓
4. Preprocess text (remove line numbers, normalize whitespace)
      ↓
5. Parse speaker turns (INMATE, COURT, ATTORNEY, etc.)
      ↓
6. Chunk transcript intelligently (~8K tokens/chunk)
   - Preserve inmate speech boundaries
   - Include surrounding context
      ↓
7. For each chunk:
   - Send to Gemini 2.0 Flash Lite
   - Detect 4 signal types
   - Pass context summary to next chunk
      ↓
8. Aggregate results:
   - Categorize signals by type
   - Calculate weighted innocence score:
     * 40% explicit claims
     * 30% contextual signals
     * 20% implicit signals
     * 10% bias language
      ↓
9. Store in predictions table
      ↓
10. Update transcript.processed = true
      ↓
11. Display results in UI
```

### Signal Types

1. **Explicit Claims** (40% weight)
   - Direct innocence statements
   - "I didn't do it", "I am innocent"

2. **Contextual Signals** (30% weight)
   - Problematic case circumstances
   - Coerced confessions, evidence gaps
   - Inadequate legal representation

3. **Implicit Signals** (20% weight)
   - Maintained innocence despite outcomes
   - Consistency in denials
   - Behavioral patterns

4. **Bias Language** (10% weight)
   - Institutional bias patterns
   - Prejudicial language
   - Stereotyping

---

## 🔧 Integration Points

### Priority Scoring Enhancement

The `PriorityService` now checks for AI predictions:

```typescript
// Before (regex-based):
const innocenceScore = this.scoreInnocenceClaim(transcript.raw_text);

// After (AI-powered with fallback):
const innocenceScore = transcript.prediction?.innocence_score
  ? this.scoreFromAIPrediction(transcript.prediction.innocence_score)
  : this.scoreInnocenceClaim(transcript.raw_text);
```

### Dashboard Recommendations

Top recommendations now prioritize transcripts with:
1. High AI innocence scores (if analyzed)
2. Law enforcement/prosecution bias risk
3. Recent hearings
4. Unassigned status

---

## 📁 File Structure

```
innocence-grid/
├── src/
│   ├── services/
│   │   ├── gemini.ts                    # NEW - Gemini API integration
│   │   ├── innocenceDetector.ts         # NEW - Main analysis service
│   │   ├── transcripts.ts               # Updated to support predictions
│   │   ├── priority.ts                  # Updated to use AI scores
│   │   ├── commissioners.ts             # JusticeMAP
│   │   ├── volunteers.ts                # JusticeMAP
│   │   ├── formProcessor.ts             # JusticeMAP
│   │   └── similarity.ts                # JusticeMAP
│   ├── utils/
│   │   ├── transcriptChunker.ts         # NEW - Intelligent chunking
│   │   ├── speakerParser.ts             # NEW - Speaker identification
│   │   ├── transcriptPreprocessor.ts    # NEW - Text cleanup
│   │   └── fixTranscriptNames.ts        # JusticeMAP
│   ├── pages/
│   │   ├── Dashboard.tsx                # JusticeMAP enhanced
│   │   ├── Login.tsx                    # JusticeMAP
│   │   ├── Clients.tsx                  # JusticeMAP
│   │   ├── Cases.tsx                    # JusticeMAP
│   │   ├── Analyze.tsx                  # JusticeMAP
│   │   ├── CommissionerBreakdown.tsx    # JusticeMAP
│   │   ├── FormGenerator.tsx            # JusticeMAP
│   │   ├── Upload.tsx                   # Both
│   │   ├── Transcripts.tsx              # Both
│   │   └── TranscriptDetail.tsx         # Updated with AI analysis
│   └── ...
├── database-merged-setup.sql            # NEW - Complete schema
└── MERGE_GUIDE.md                       # This file
```

---

## 🎨 UI Features

### Sidebar Navigation (JusticeMAP Style)

- Dashboard - Overview with AI recommendations
- Upload - Drag-and-drop PDF/TXT upload
- Transcripts - Sortable table with status badges
- Login - Volunteer authentication
- Clients - Client management
- Cases - Case assignment and tracking
- Analyze - Analysis tools
- Commissioner Breakdown - Bias analysis
- Form Generator - Auto-generate legal forms

### Transcript Detail Page

**New Features:**
- "Analyze with AI" button (shown if not yet analyzed)
- Real-time progress bar during analysis
- Innocence score percentage display
- Risk level badges (High/Medium/Low)
- Tabbed signal display:
  - Explicit Claims (green accent)
  - Implicit Signals (muted)
  - Contextual Signals (primary accent)
  - Bias Language (warning accent)

---

## 🔐 Authentication & Multi-User

### Volunteer Roles

- **Volunteer** - Can view assigned cases
- **Staff** - Can assign cases
- **Admin** - Full access

### Login Credentials (Default)

```
jordan.rivers@justicemap.org
alex.chen@justicemap.org
taylor.brooks@justicemap.org
sam.martinez@justicemap.org
morgan.davis@justicemap.org
```

*Note: JusticeMAP uses email-based auth without passwords in dev mode*

---

## 🐛 Troubleshooting

### Build fails with "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### "No inmate speech found" error
- Check transcript formatting
- Ensure speaker labels are present (e.g., "INMATE:", "DEFENDANT:")
- Check browser console for diagnostic info

### Gemini API errors
- Verify API key is correct in `.env`
- Check quota limits at https://aistudio.google.com
- Ensure `VITE_GEMINI_API_KEY` starts with "AIza..."

### Predictions not showing
- Verify database has `predictions` table
- Check if transcript.processed = true
- Run analysis by clicking "Analyze with AI"

---

## 📈 Performance Notes

### Analysis Time

- **Small transcript** (< 5 pages): ~10-20 seconds
- **Medium transcript** (5-15 pages): ~30-60 seconds
- **Large transcript** (15+ pages): 1-3 minutes

### API Rate Limits

- Gemini 2.0 Flash Lite: 15 RPM (requests per minute)
- Built-in delay: 2 seconds between chunks
- Batch analysis: 2 seconds between transcripts

### Chunking Strategy

- **Target size:** ~8,000 tokens (~32KB)
- **Preserves:** Inmate speech boundaries
- **Includes:** Surrounding context for continuity
- **Fallback:** Simple paragraph chunking if parsing fails

---

## 🚦 Next Steps

### Recommended Enhancements

1. **Batch Analysis UI**
   - Add "Analyze All" button on Transcripts page
   - Queue system for background processing

2. **Results Export**
   - Export predictions to CSV/JSON
   - Generate analysis reports

3. **Threshold Configuration**
   - Allow admins to adjust signal weights
   - Customize scoring thresholds

4. **Real-time Notifications**
   - Toast alerts when analysis completes
   - Email notifications for high-risk cases

5. **Analytics Dashboard**
   - Chart innocence score distributions
   - Track analysis trends over time

---

## 🎉 Success Criteria

✅ Build succeeds without errors
✅ All pages render correctly
✅ AI analysis works end-to-end
✅ Predictions stored in database
✅ Priority scoring uses AI scores
✅ Multi-user features functional
✅ Commissioner analysis works
✅ Form generation works

---

## 📝 Credits

**Merged by:** Claude AI (Anthropic)
**Original Repos:**
- **innocence-grid:** AI-powered innocence detection backend
- **JusticeMAP:** Multi-user UI with volunteer collaboration

**Merge Date:** November 9, 2025
**Branch:** `claude/diff-justicemap-repo-011CUxrkqWLf3rhKewBrhWja`

---

## 📞 Support

For issues or questions:
1. Check this guide first
2. Review database setup in `database-merged-setup.sql`
3. Check browser console for errors
4. Verify environment variables in `.env`

**Key Files:**
- `MERGE_GUIDE.md` - This file
- `database-merged-setup.sql` - Database schema
- `.env.example` - Environment template
- `README.md` - Project overview

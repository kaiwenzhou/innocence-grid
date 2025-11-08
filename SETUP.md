# Innocence Grid - Setup Guide

This guide will walk you through setting up the Innocence Grid application with Supabase.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Node.js and npm installed

## 1. Create a Supabase Project

1. Go to https://supabase.com and create a new project
2. Wait for the project to be fully initialized
3. Note down your project URL and anon key (found in Project Settings > API)

## 2. Set Up the Database

1. In your Supabase project dashboard, go to the SQL Editor
2. Create a new query and paste the following SQL:

```sql
-- Create transcripts table
CREATE TABLE transcripts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    file_name TEXT NOT NULL,
    raw_text TEXT NOT NULL,

    -- metadata extracted from filename/text
    hearing_date DATE,
    inmate_name TEXT,
    cdcr_number TEXT,

    -- processing status
    processed BOOLEAN DEFAULT FALSE,
    uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Create predictions table
CREATE TABLE predictions (
    id SERIAL PRIMARY KEY,
    transcript_id TEXT REFERENCES transcripts(id) ON DELETE CASCADE,

    innocence_score REAL,
    explicit_claims JSONB DEFAULT '[]',
    implicit_signals JSONB DEFAULT '[]',

    model_version TEXT,
    analyzed_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_transcripts_processed ON transcripts(processed);
CREATE INDEX idx_predictions_transcript ON predictions(transcript_id);
CREATE INDEX idx_predictions_score ON predictions(innocence_score);
```

3. Click "Run" to execute the SQL

## 3. Configure Environment Variables

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   Replace `your_supabase_project_url` and `your_supabase_anon_key` with the values from your Supabase project settings.

## 4. Install Dependencies

If you haven't already, install the project dependencies:

```bash
npm install
```

## 5. Start the Development Server

```bash
npm run dev
```

The application should now be running at http://localhost:5173 (or another port if 5173 is in use).

## Using the Application

### Uploading Transcripts

1. Navigate to the Upload page
2. Drag and drop a text file (.txt) or click to browse
3. The file will be uploaded to Supabase

**Filename Format (Optional):**
For automatic metadata extraction, name your files like:
```
YYYY-MM-DD_InmateName_CDCRXXXXXX.txt
```

Example: `2024-01-15_JohnDoe_CDCR123456.txt`

This will automatically extract:
- Hearing date: 2024-01-15
- Inmate name: JohnDoe
- CDCR number: CDCR123456

### Viewing Transcripts

1. Navigate to the Transcripts page
2. View all uploaded transcripts in a sortable table
3. Click on any transcript to view its details (if detail page is implemented)

### Dashboard

The Dashboard shows:
- Total number of transcripts
- Number of processed transcripts
- Number of pending transcripts

## Database Schema

### Transcripts Table

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT | Primary key (UUID) |
| file_name | TEXT | Name of the uploaded file |
| raw_text | TEXT | Full text content of the transcript |
| hearing_date | DATE | Date of the hearing (optional) |
| inmate_name | TEXT | Name of the inmate (optional) |
| cdcr_number | TEXT | CDCR number (optional) |
| processed | BOOLEAN | Whether the transcript has been analyzed |
| uploaded_at | TIMESTAMP | When the transcript was uploaded |

### Predictions Table

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| transcript_id | TEXT | Foreign key to transcripts |
| innocence_score | REAL | Score indicating likelihood of innocence |
| explicit_claims | JSONB | Array of explicit innocence claims |
| implicit_signals | JSONB | Array of implicit signals |
| model_version | TEXT | Version of the analysis model used |
| analyzed_at | TIMESTAMP | When the analysis was performed |

## Troubleshooting

### "Missing Supabase environment variables" Error

Make sure:
1. You have created a `.env` file in the project root
2. The `.env` file contains both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. The values are correct (no quotes around them)
4. You've restarted the development server after creating/editing the `.env` file

### No Transcripts Appearing

1. Check the browser console for errors
2. Verify your Supabase connection by checking the Network tab
3. Make sure the database tables were created correctly
4. Try uploading a new transcript

### Upload Errors

1. Check that the file is a valid text (.txt) file
2. Verify Supabase is accessible (check project status)
3. Check browser console for detailed error messages

## Next Steps

Future enhancements:
- Implement AI-powered analysis to populate the predictions table
- Add user authentication
- Add transcript detail view with highlighting
- Add batch upload capability
- Implement search and advanced filtering

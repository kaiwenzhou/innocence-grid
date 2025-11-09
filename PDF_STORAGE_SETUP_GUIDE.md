# PDF Storage Setup Guide

## Overview
We've implemented PDF storage functionality so users can view the original uploaded PDFs. This guide will help you set up Supabase Storage to make this work.

## What's Been Implemented

### 1. Database Changes
- Added `pdf_url` column to store the Supabase storage path
- Added `pdf_file_size` column to track file sizes

### 2. Code Changes
- **Updated Type Definitions** (`src/lib/types.ts`):
  - Added `pdf_url` and `pdf_file_size` fields to `Transcript` interface

- **Updated Upload Service** (`src/services/transcripts.ts`):
  - Modified `uploadTranscript()` to upload PDFs to Supabase storage
  - Stores the public URL in the database
  - Gracefully handles storage errors (continues with text extraction even if PDF upload fails)

- **Updated Cases Page** (`src/pages/Cases.tsx`):
  - "View Full Transcript" button now opens the PDF in a new tab if available
  - Shows PDF icon and updated text when PDF is available
  - Falls back to transcript detail page if no PDF is stored

## Setup Instructions

### Step 1: Run the Database Migration

Run the SQL file in your Supabase SQL Editor:

```bash
# The file is located at: add-pdf-storage.sql
```

Or copy and paste this SQL directly:

```sql
-- Add PDF storage support to transcripts table
ALTER TABLE transcripts 
ADD COLUMN IF NOT EXISTS pdf_url TEXT;

ALTER TABLE transcripts 
ADD COLUMN IF NOT EXISTS pdf_file_size BIGINT;
```

### Step 2: Create Storage Bucket in Supabase

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Navigate to Storage** (left sidebar)
3. **Click "Create a new bucket"**
4. **Configure the bucket**:
   - **Name**: `transcript-pdfs`
   - **Public bucket**: ✅ **YES** (checked)
   - **File size limit**: `52428800` (50 MB)
   - **Allowed MIME types**: `application/pdf`

5. **Click "Create bucket"**

### Step 3: Set Storage Policies

After creating the bucket, you need to set up access policies:

1. Go to **Storage > Policies**
2. Click on your `transcript-pdfs` bucket
3. Click **"New Policy"** and add these policies:

#### Policy 1: Public Read Access
```sql
-- Allow anyone to read PDFs
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'transcript-pdfs');
```

#### Policy 2: Authenticated Upload (Optional)
```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'transcript-pdfs');
```

**OR** if you want anyone to upload (for testing):

```sql
-- Allow anyone to upload (for development)
CREATE POLICY "Anyone can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'transcript-pdfs');
```

### Step 4: Test the Feature

1. **Upload a new PDF transcript**:
   - Go to the Upload page
   - Select a PDF file
   - Upload it

2. **View the case**:
   - Navigate to the Cases page
   - Select a case with a PDF
   - Click "View Full Transcript (PDF)"
   - The original PDF should open in a new tab

## How It Works

### Upload Flow
1. User uploads a PDF file
2. System extracts text from PDF (for AI analysis)
3. System uploads PDF to Supabase storage bucket
4. System stores the public URL in the database
5. Text is processed normally

### View Flow
1. User clicks "View Full Transcript (PDF)"
2. Button opens the stored PDF URL in a new browser tab
3. Browser displays the PDF using its built-in PDF viewer

## Troubleshooting

### "View Full Transcript" button doesn't show PDF
- **Issue**: Old transcripts uploaded before this feature won't have PDFs
- **Solution**: 
  - Re-upload the transcript, OR
  - Manually upload PDFs to storage and update the database

### Storage upload fails
- **Check**: Is the storage bucket created?
- **Check**: Are the policies set correctly?
- **Check**: Is the bucket name exactly `transcript-pdfs`?
- **Check**: Is the file size under 50MB?

### PDF doesn't open
- **Check**: Is the `pdf_url` stored in the database?
- **Check**: Is the storage bucket set to "public"?
- **Check**: Are the storage policies allowing SELECT?

## Future Enhancements

- Add PDF download button (in addition to view)
- Add PDF annotation/highlighting features
- Add PDF search functionality
- Implement PDF caching for faster loading
- Add thumbnail generation for PDFs
- Support for viewing PDFs in an embedded viewer instead of new tab

## Migration for Existing Data

If you have existing transcripts and their original PDFs:

1. Upload PDFs to the storage bucket manually
2. Get the public URLs
3. Update the database:

```sql
UPDATE transcripts
SET pdf_url = 'https://your-project.supabase.co/storage/v1/object/public/transcript-pdfs/filename.pdf',
    pdf_file_size = 1234567  -- file size in bytes
WHERE id = 'transcript-id';
```

## Support

If you encounter any issues:
1. Check Supabase logs (Dashboard > Logs)
2. Check browser console for errors
3. Verify storage bucket settings
4. Ensure policies are correctly set


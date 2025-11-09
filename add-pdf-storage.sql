-- Add PDF storage support to transcripts table

-- Step 1: Add pdf_url column to store the Supabase storage path
ALTER TABLE transcripts 
ADD COLUMN IF NOT EXISTS pdf_url TEXT;

-- Step 2: Add pdf_file_size column (optional, for tracking)
ALTER TABLE transcripts 
ADD COLUMN IF NOT EXISTS pdf_file_size BIGINT;

-- Step 3: Create a storage bucket for PDFs (if not exists)
-- Run this in Supabase Dashboard -> Storage, or via SQL:
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES ('transcript-pdfs', 'transcript-pdfs', true, 52428800, ARRAY['application/pdf'])
-- ON CONFLICT (id) DO NOTHING;

-- Step 4: Create storage policies for public access
-- CREATE POLICY "Public Access"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'transcript-pdfs');

-- CREATE POLICY "Authenticated users can upload"
-- ON storage.objects FOR INSERT
-- WITH CHECK (bucket_id = 'transcript-pdfs' AND auth.role() = 'authenticated');

-- Note: You need to create the storage bucket manually in Supabase Dashboard:
-- 1. Go to Storage in Supabase Dashboard
-- 2. Click "Create a new bucket"
-- 3. Name: transcript-pdfs
-- 4. Public bucket: YES (for easy access)
-- 5. File size limit: 50 MB
-- 6. Allowed MIME types: application/pdf

COMMENT ON COLUMN transcripts.pdf_url IS 'Supabase storage path to the original PDF file';
COMMENT ON COLUMN transcripts.pdf_file_size IS 'Size of the PDF file in bytes';


-- ============================================
-- FIX: Add missing columns for case management
-- ============================================
-- Run this in Supabase SQL Editor NOW!

-- Add status column if it doesn't exist
ALTER TABLE transcripts 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'unassigned'
CHECK (status IN ('unassigned', 'assigned', 'in_review', 'completed', 'flagged'));

-- Add assigned_to column if it doesn't exist
ALTER TABLE transcripts 
ADD COLUMN IF NOT EXISTS assigned_to TEXT;

-- Add assigned_at column if it doesn't exist
ALTER TABLE transcripts 
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP;

-- Add form_data column to store generated form data
ALTER TABLE transcripts 
ADD COLUMN IF NOT EXISTS form_data JSONB;

-- Update existing records that are processed to have status 'completed'
UPDATE transcripts 
SET status = 'completed' 
WHERE processed = true AND status = 'unassigned';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_transcripts_status ON transcripts(status);

-- Verify the columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'transcripts'
ORDER BY ordinal_position;


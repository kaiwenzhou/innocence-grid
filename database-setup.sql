-- ==================================================
-- HACK FOR SOCIAL GOOD - DATABASE SETUP SQL
-- ==================================================
-- Wrongful Conviction Analyzer (based on Innocence Grid)
-- This file contains the complete database schema.
-- Execute this in your Supabase SQL Editor.

-- ==================================================
-- OPTION 1: SIMPLE SCHEMA (No Authentication)
-- ==================================================
-- Use this if you want to get started quickly without user auth

-- Create transcripts table
CREATE TABLE IF NOT EXISTS transcripts (
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
CREATE TABLE IF NOT EXISTS predictions (
    id SERIAL PRIMARY KEY,
    transcript_id TEXT REFERENCES transcripts(id) ON DELETE CASCADE,
    
    innocence_score REAL,
    explicit_claims JSONB DEFAULT '[]',
    implicit_signals JSONB DEFAULT '[]',
    
    model_version TEXT,
    analyzed_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transcripts_processed ON transcripts(processed);
CREATE INDEX IF NOT EXISTS idx_predictions_transcript ON predictions(transcript_id);
CREATE INDEX IF NOT EXISTS idx_predictions_score ON predictions(innocence_score);


-- ==================================================
-- OPTION 2: ADVANCED SCHEMA (With Authentication & RLS)
-- ==================================================
-- Use this if you want user authentication and data isolation
-- COMMENT OUT OPTION 1 ABOVE IF USING THIS

/*
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create transcripts table with authentication
CREATE TABLE public.transcripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename TEXT NOT NULL,
  innocence_score DECIMAL(3,2) NOT NULL CHECK (innocence_score >= 0 AND innocence_score <= 1),
  date_uploaded TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  content TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create claims table
CREATE TABLE public.claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transcript_id UUID REFERENCES public.transcripts(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  start_index INTEGER NOT NULL,
  end_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;

-- RLS Policies for transcripts
CREATE POLICY "Users can view their own transcripts"
  ON public.transcripts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transcripts"
  ON public.transcripts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transcripts"
  ON public.transcripts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transcripts"
  ON public.transcripts FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for claims (linked to transcripts)
CREATE POLICY "Users can view claims for their transcripts"
  ON public.claims FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.transcripts
    WHERE transcripts.id = claims.transcript_id
    AND transcripts.user_id = auth.uid()
  ));

-- Create indexes for performance
CREATE INDEX transcripts_user_id_idx ON public.transcripts(user_id);
CREATE INDEX transcripts_innocence_score_idx ON public.transcripts(innocence_score);
CREATE INDEX claims_transcript_id_idx ON public.claims(transcript_id);

-- Create storage bucket for PDF files
INSERT INTO storage.buckets (id, name, public)
VALUES ('transcripts', 'transcripts', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
CREATE POLICY "Users can upload their own transcripts"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'transcripts' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own transcript files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'transcripts' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
*/

-- ==================================================
-- SAMPLE DATA (Optional - for testing)
-- ==================================================
-- Uncomment to insert sample data

/*
INSERT INTO transcripts (file_name, raw_text, hearing_date, inmate_name, cdcr_number, processed)
VALUES 
  ('2024-01-15_JohnDoe_CDCR123456.txt', 
   'Sample transcript content here...', 
   '2024-01-15', 
   'John Doe', 
   'CDCR123456', 
   true);

INSERT INTO predictions (transcript_id, innocence_score, model_version)
VALUES 
  ((SELECT id FROM transcripts LIMIT 1), 
   0.75, 
   'v1.0');
*/


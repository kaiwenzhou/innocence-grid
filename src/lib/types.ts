/**
 * Database Schema Types
 *
 * These types match the Supabase database schema.
 */

export interface Database {
  public: {
    Tables: {
      transcripts: {
        Row: {
          id: string;
          file_name: string;
          raw_text: string;
          hearing_date: string | null;
          inmate_name: string | null;
          cdcr_number: string | null;
          processed: boolean;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          file_name: string;
          raw_text: string;
          hearing_date?: string | null;
          inmate_name?: string | null;
          cdcr_number?: string | null;
          processed?: boolean;
          uploaded_at?: string;
        };
        Update: {
          id?: string;
          file_name?: string;
          raw_text?: string;
          hearing_date?: string | null;
          inmate_name?: string | null;
          cdcr_number?: string | null;
          processed?: boolean;
        };
      };
      predictions: {
        Row: {
          id: number;
          transcript_id: string;
          innocence_score: number | null;
          explicit_claims: any; // JSONB
          implicit_signals: any; // JSONB
          model_version: string | null;
          analyzed_at: string;
        };
        Insert: {
          transcript_id: string;
          innocence_score?: number | null;
          explicit_claims?: any;
          implicit_signals?: any;
          model_version?: string | null;
          analyzed_at?: string;
        };
        Update: {
          transcript_id?: string;
          innocence_score?: number | null;
          explicit_claims?: any;
          implicit_signals?: any;
          model_version?: string | null;
        };
      };
    };
  };
}

// Application types
export interface Transcript {
  id: string;
  file_name: string;
  raw_text: string;
  hearing_date: string | null;
  inmate_name: string | null;
  cdcr_number: string | null;
  processed: boolean;
  uploaded_at: string;
  prediction?: Prediction;
}

export interface Prediction {
  id: number;
  transcript_id: string;
  innocence_score: number | null;
  explicit_claims: InnocenceClaim[];
  implicit_signals: InnocenceClaim[];
  model_version: string | null;
  analyzed_at: string;
}

export interface InnocenceClaim {
  text: string;
  signal_type: 'explicit' | 'implicit' | 'contextual' | 'bias_language';
  confidence: number;
  start_index: number;
  end_index: number;
  explanation?: string;
}

export interface SpeakerTurn {
  speaker: string;
  text: string;
  startIndex: number;
  endIndex: number;
}

export interface TranscriptChunk {
  turns: SpeakerTurn[];
  text: string;
  startIndex: number;
  endIndex: number;
}

/**
 * Suggested Supabase Migration SQL:
 * 
 * -- Enable UUID extension
 * create extension if not exists "uuid-ossp";
 * 
 * -- Create transcripts table
 * create table public.transcripts (
 *   id uuid primary key default uuid_generate_v4(),
 *   filename text not null,
 *   innocence_score decimal(3,2) not null check (innocence_score >= 0 and innocence_score <= 1),
 *   date_uploaded timestamp with time zone default now(),
 *   content text not null,
 *   user_id uuid references auth.users(id) on delete cascade not null,
 *   created_at timestamp with time zone default now(),
 *   updated_at timestamp with time zone default now()
 * );
 * 
 * -- Create claims table
 * create table public.claims (
 *   id uuid primary key default uuid_generate_v4(),
 *   transcript_id uuid references public.transcripts(id) on delete cascade not null,
 *   text text not null,
 *   confidence decimal(3,2) not null check (confidence >= 0 and confidence <= 1),
 *   start_index integer not null,
 *   end_index integer not null,
 *   created_at timestamp with time zone default now()
 * );
 * 
 * -- Enable RLS
 * alter table public.transcripts enable row level security;
 * alter table public.claims enable row level security;
 * 
 * -- RLS Policies for transcripts
 * create policy "Users can view their own transcripts"
 *   on public.transcripts for select
 *   using (auth.uid() = user_id);
 * 
 * create policy "Users can insert their own transcripts"
 *   on public.transcripts for insert
 *   with check (auth.uid() = user_id);
 * 
 * create policy "Users can update their own transcripts"
 *   on public.transcripts for update
 *   using (auth.uid() = user_id);
 * 
 * create policy "Users can delete their own transcripts"
 *   on public.transcripts for delete
 *   using (auth.uid() = user_id);
 * 
 * -- RLS Policies for claims (linked to transcripts)
 * create policy "Users can view claims for their transcripts"
 *   on public.claims for select
 *   using (exists (
 *     select 1 from public.transcripts
 *     where transcripts.id = claims.transcript_id
 *     and transcripts.user_id = auth.uid()
 *   ));
 * 
 * -- Create indexes for performance
 * create index transcripts_user_id_idx on public.transcripts(user_id);
 * create index transcripts_innocence_score_idx on public.transcripts(innocence_score);
 * create index claims_transcript_id_idx on public.claims(transcript_id);
 * 
 * -- Create storage bucket for PDF files
 * insert into storage.buckets (id, name, public)
 * values ('transcripts', 'transcripts', false);
 * 
 * -- Storage RLS policies
 * create policy "Users can upload their own transcripts"
 *   on storage.objects for insert
 *   with check (
 *     bucket_id = 'transcripts' and
 *     auth.uid()::text = (storage.foldername(name))[1]
 *   );
 * 
 * create policy "Users can view their own transcript files"
 *   on storage.objects for select
 *   using (
 *     bucket_id = 'transcripts' and
 *     auth.uid()::text = (storage.foldername(name))[1]
 *   );
 */

/**
 * Database Schema Types
 * 
 * These types match the expected Supabase database schema.
 * When migrating to Supabase, create tables matching these types.
 */

export interface Database {
  public: {
    Tables: {
      transcripts: {
        Row: {
          id: string;
          filename: string;
          innocence_score: number;
          date_uploaded: string;
          content: string;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          filename: string;
          innocence_score: number;
          date_uploaded?: string;
          content: string;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          filename?: string;
          innocence_score?: number;
          date_uploaded?: string;
          content?: string;
          user_id?: string;
          updated_at?: string;
        };
      };
      claims: {
        Row: {
          id: string;
          transcript_id: string;
          text: string;
          confidence: number;
          start_index: number;
          end_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          transcript_id: string;
          text: string;
          confidence: number;
          start_index: number;
          end_index: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          transcript_id?: string;
          text?: string;
          confidence?: number;
          start_index?: number;
          end_index?: number;
        };
      };
    };
  };
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

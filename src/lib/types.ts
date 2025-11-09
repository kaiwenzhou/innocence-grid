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
export interface Volunteer {
  id: string;
  email: string;
  full_name: string;
  role: 'volunteer' | 'staff' | 'admin';
  active: boolean;
  created_at: string;
  last_login: string | null;
}

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
  assigned_to: string | null;
  assigned_at: string | null;
  status: 'unassigned' | 'assigned' | 'in_review' | 'completed' | 'flagged';
  pdf_url: string | null;
  pdf_file_size: number | null;
}

export interface Prediction {
  id: number;
  transcript_id: string;
  innocence_score: number | null;
  explicit_claims: any[];
  implicit_signals: any[];
  contextual_signals?: any[];
  bias_language?: any[];
  model_version: string | null;
  analyzed_at: string;
}

export interface CaseAssignment {
  id: string;
  transcript_id: string;
  volunteer_id: string;
  assigned_at: string;
  completed_at: string | null;
  notes: string | null;
  status: 'active' | 'completed' | 'reassigned';
}

export interface CaseNote {
  id: string;
  transcript_id: string;
  volunteer_id: string;
  note_text: string;
  note_type: 'general' | 'innocence_flag' | 'bias_detected' | 'follow_up';
  created_at: string;
}

// AI Priority Recommendations
export interface PriorityRecommendation {
  transcript: Transcript;
  score: number;
  rank: number;
  reasons: string[];
  breakdown: {
    innocenceScore: number;
    biasScore: number;
    urgencyScore: number;
    statusScore: number;
  };
}

// Similar Case Matching
export interface SimilarCase {
  transcript: Transcript;
  similarityScore: number;
  matchReasons: string[];
  matchType: 'commissioner' | 'innocence_claim' | 'crime_type' | 'outcome';
}

// Narrative Assistant
export interface ExtractedFact {
  type: 'program' | 'achievement' | 'support' | 'commissioner_comment' | 'timeline';
  text: string;
  source: string;
  confidence: number;
}

export interface NarrativeSuggestion {
  section: string;
  suggestedText: string;
  rationale: string;
  basedOn: string[];
}

export interface NarrativeStrength {
  score: number;
  length: 'too_short' | 'good' | 'too_long';
  tone: 'defensive' | 'balanced' | 'empathetic';
  flags: string[];
  suggestions: string[];
}

// Commissioner Types
export interface Commissioner {
  id: string;
  full_name: string;
  first_name: string | null;
  last_name: string | null;
  profile_url: string | null;
  photo_url: string | null;
  biography: string | null;
  background_category: string | null;
  background_details: string | null;
  appointment_date: string | null;
  term_end_date: string | null;
  previous_roles: PreviousRole[];
  education: Education[];
  specializations: string[];
  email: string | null;
  phone: string | null;
  office_location: string | null;
  active: boolean;
  data_source: string;
  last_scraped_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PreviousRole {
  title: string;
  organization: string;
  start_date?: string;
  end_date?: string;
  description?: string;
}

export interface Education {
  degree: string;
  institution: string;
  year?: string;
  field?: string;
}

export interface CommissionerHearing {
  id: string;
  commissioner_id: string;
  transcript_id: string;
  hearing_date: string | null;
  hearing_type: 'parole_suitability' | 'youth_offender' | 'elderly' | 'medical';
  hearing_outcome: string | null;
  decision_rationale: string | null;
  bias_indicators: any[];
  created_at: string;
}

export interface CommissionerStatistics {
  id: string;
  commissioner_id: string;
  total_hearings: number;
  total_grants: number;
  total_denials: number;
  grant_rate: number;
  innocence_claims_reviewed: number;
  high_bias_cases: number;
  avg_hearing_duration_minutes: number | null;
  last_calculated_at: string;
  updated_at: string;
}

export interface CommissionerWithStats extends Commissioner {
  statistics?: CommissionerStatistics;
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

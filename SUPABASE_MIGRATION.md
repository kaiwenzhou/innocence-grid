# Supabase Migration Guide

This document provides a step-by-step guide to migrate the Wrongful Conviction Analyzer from mock data to a fully functional Supabase backend.

## Architecture Overview

The app is built with a **service layer architecture** that abstracts data operations. This makes the migration to Supabase straightforward:

- **Current**: `TranscriptService` → Mock Data
- **After Migration**: `TranscriptService` → Supabase Client → Database

## Prerequisites

Before starting the migration, you'll need:

1. Enable Lovable Cloud in your project
2. Basic understanding of Supabase (authentication, database, storage)

## Migration Steps

### Step 1: Enable Lovable Cloud

From the Lovable interface, enable Lovable Cloud. This will provision a Supabase instance for your project.

### Step 2: Create Database Schema

Use the SQL provided in `src/lib/types.ts` to create your database tables:

```sql
-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. Create transcripts table
create table public.transcripts (
  id uuid primary key default uuid_generate_v4(),
  filename text not null,
  innocence_score decimal(3,2) not null check (innocence_score >= 0 and innocence_score <= 1),
  date_uploaded timestamp with time zone default now(),
  content text not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 3. Create claims table
create table public.claims (
  id uuid primary key default uuid_generate_v4(),
  transcript_id uuid references public.transcripts(id) on delete cascade not null,
  text text not null,
  confidence decimal(3,2) not null check (confidence >= 0 and confidence <= 1),
  start_index integer not null,
  end_index integer not null,
  created_at timestamp with time zone default now()
);

-- 4. Enable RLS
alter table public.transcripts enable row level security;
alter table public.claims enable row level security;

-- 5. Create RLS policies (see full SQL in types.ts)
-- 6. Create indexes for performance (see full SQL in types.ts)
-- 7. Set up storage bucket (see full SQL in types.ts)
```

### Step 3: Update TranscriptService

Replace the mock implementations in `src/services/transcripts.ts`:

```typescript
import { supabase } from "@/integrations/supabase/client";
import { Transcript, Claim } from "@/lib/mockData";

export class TranscriptService {
  static async getAllTranscripts(): Promise<Transcript[]> {
    const { data, error } = await supabase
      .from('transcripts')
      .select(`
        *,
        claims (*)
      `)
      .order('date_uploaded', { ascending: false });

    if (error) throw error;

    // Transform database rows to match Transcript type
    return data.map(row => ({
      id: row.id,
      filename: row.filename,
      innocenceScore: row.innocence_score,
      dateUploaded: row.date_uploaded,
      content: row.content,
      claims: row.claims.map((c: any) => ({
        text: c.text,
        confidence: c.confidence,
        startIndex: c.start_index,
        endIndex: c.end_index
      }))
    }));
  }

  static async getTranscriptById(id: string): Promise<Transcript | null> {
    const { data, error } = await supabase
      .from('transcripts')
      .select(`
        *,
        claims (*)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      filename: data.filename,
      innocenceScore: data.innocence_score,
      dateUploaded: data.date_uploaded,
      content: data.content,
      claims: data.claims.map((c: any) => ({
        text: c.text,
        confidence: c.confidence,
        startIndex: c.start_index,
        endIndex: c.end_index
      }))
    };
  }

  // ... implement other methods similarly
}
```

### Step 4: Implement PDF Upload Flow

The PDF upload requires multiple steps:

1. **Upload PDF to Supabase Storage**
2. **Extract text from PDF** (via Edge Function)
3. **Analyze transcript with AI** (via Edge Function)
4. **Store results in database**

Create an edge function `supabase/functions/analyze-transcript/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileUrl, userId } = await req.json();

    // 1. Download PDF from storage
    // 2. Extract text using a PDF parsing library
    // 3. Analyze text with AI (OpenAI/Anthropic) to:
    //    - Calculate innocence score
    //    - Extract claims with positions
    // 4. Return structured data

    return new Response(
      JSON.stringify({ 
        content: extractedText,
        innocenceScore: 0.85,
        claims: extractedClaims
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

### Step 5: Add Authentication

1. Create an auth page with login/signup
2. Protect routes that require authentication
3. Update RLS policies to filter by `auth.uid()`

Example auth implementation:

```typescript
// src/pages/Auth.tsx
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignUp = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`
      }
    });
    if (!error) navigate("/dashboard");
  };

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (!error) navigate("/dashboard");
  };

  // ... render form
};
```

### Step 6: Implement Real-time Updates (Optional)

Enable real-time subscriptions to get instant updates when new transcripts are added:

```typescript
useEffect(() => {
  const channel = supabase
    .channel('transcripts-changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'transcripts'
      },
      (payload) => {
        // Update UI with new transcript
        setTranscripts(prev => [payload.new, ...prev]);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

## Testing the Migration

After completing the migration:

1. Test user registration and login
2. Upload a sample PDF
3. Verify transcript appears in table
4. Check filtering and sorting
5. Test detail page
6. Verify RLS policies (users can only see their own data)

## Architecture Benefits

This architecture provides:

- **Clean separation of concerns**: UI components don't know about data source
- **Easy testing**: Mock the service layer for unit tests
- **Type safety**: TypeScript interfaces ensure consistency
- **Flexibility**: Swap implementations without changing UI code
- **Scalability**: Service layer can implement caching, retry logic, etc.

## Next Steps

After basic migration:

1. **Add AI Analysis**: Implement actual PDF text extraction and AI scoring
2. **Optimize Queries**: Add database indexes for common queries
3. **Add Caching**: Cache frequently accessed transcripts
4. **Implement Search**: Full-text search across transcript content
5. **Add Exports**: Generate PDF reports of analysis results

## Troubleshooting

Common issues and solutions:

- **RLS blocking queries**: Check RLS policies match user authentication
- **Storage upload fails**: Verify storage bucket policies
- **Type mismatches**: Ensure database schema matches TypeScript types
- **CORS errors**: Verify edge function CORS headers

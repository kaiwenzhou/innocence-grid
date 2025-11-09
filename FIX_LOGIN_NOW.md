# 🚨 FIX LOGIN ERROR - DO THIS NOW!

## The Problem
The `volunteers` table doesn't exist in your Supabase database yet.

## The Solution (3 Minutes)

### STEP 1: Open Supabase SQL Editor
**Click this link**: https://supabase.com/dashboard/project/qymvmcxnwdkegdctxibi/sql

### STEP 2: Copy This SQL

```sql
-- JUSTICEMAP - VOLUNTEER AUTHENTICATION & CASE ASSIGNMENT
-- Add this to your existing Supabase database

-- ============================================
-- VOLUNTEERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS volunteers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'volunteer' CHECK (role IN ('volunteer', 'staff', 'admin')),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP
);

-- ============================================
-- ADD ASSIGNMENT TRACKING TO TRANSCRIPTS
-- ============================================

-- Add new columns to existing transcripts table
ALTER TABLE transcripts 
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES volunteers(id),
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'unassigned' 
    CHECK (status IN ('unassigned', 'assigned', 'in_review', 'completed', 'flagged'));

-- ============================================
-- CASE ASSIGNMENTS TABLE (Assignment History)
-- ============================================

CREATE TABLE IF NOT EXISTS case_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transcript_id TEXT REFERENCES transcripts(id) ON DELETE CASCADE,
    volunteer_id UUID REFERENCES volunteers(id),
    assigned_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    notes TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'reassigned'))
);

-- ============================================
-- CASE NOTES TABLE (For volunteer annotations)
-- ============================================

CREATE TABLE IF NOT EXISTS case_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transcript_id TEXT REFERENCES transcripts(id) ON DELETE CASCADE,
    volunteer_id UUID REFERENCES volunteers(id),
    note_text TEXT NOT NULL,
    note_type TEXT CHECK (note_type IN ('general', 'innocence_flag', 'bias_detected', 'follow_up')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- INSERT 5 VOLUNTEER ACCOUNTS
-- ============================================

INSERT INTO volunteers (email, full_name, role) VALUES
    ('jordan.rivers@justicemap.org', 'Jordan Rivers', 'volunteer'),
    ('alex.chen@justicemap.org', 'Alex Chen', 'volunteer'),
    ('taylor.brooks@justicemap.org', 'Taylor Brooks', 'volunteer'),
    ('sam.martinez@justicemap.org', 'Sam Martinez', 'volunteer'),
    ('morgan.davis@justicemap.org', 'Morgan Davis', 'volunteer')
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_transcripts_assigned_to ON transcripts(assigned_to);
CREATE INDEX IF NOT EXISTS idx_transcripts_status ON transcripts(status);
CREATE INDEX IF NOT EXISTS idx_case_assignments_transcript ON case_assignments(transcript_id);
CREATE INDEX IF NOT EXISTS idx_case_assignments_volunteer ON case_assignments(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_case_notes_transcript ON case_notes(transcript_id);
```

### STEP 3: Paste and Run
1. **Paste the SQL above** into the Supabase SQL Editor
2. **Click the green "RUN" button** (bottom right)
3. **Wait for**: ✅ "Success. No rows returned"

### STEP 4: Verify
Run this query to check:
```sql
SELECT * FROM volunteers;
```

You should see **5 volunteers** listed!

### STEP 5: Try Login Again
1. Go back to: `http://localhost:8080/login`
2. Click any volunteer button
3. **IT WILL WORK NOW!** ✅

---

## What This Creates

✅ 5 volunteer accounts:
- jordan.rivers@justicemap.org → Jordan Rivers
- alex.chen@justicemap.org → Alex Chen
- taylor.brooks@justicemap.org → Taylor Brooks
- sam.martinez@justicemap.org → Sam Martinez
- morgan.davis@justicemap.org → Morgan Davis

✅ New tables:
- `volunteers` - User accounts
- `case_assignments` - Assignment tracking
- `case_notes` - Notes on cases

✅ New columns in `transcripts`:
- `assigned_to` - Links to volunteer
- `assigned_at` - Timestamp
- `status` - unassigned/assigned/in_review/completed/flagged

---

## Still Not Working?

**Open browser console** (F12 → Console tab) and share the error message with me!

**Or check:**
1. Is your Supabase URL correct in `.env`?
2. Is your Supabase anon key correct in `.env`?
3. Did the SQL run successfully without errors?

---

**This will fix it 100%! Just run the SQL!** 🚀


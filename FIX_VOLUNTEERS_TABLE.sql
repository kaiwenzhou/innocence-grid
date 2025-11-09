-- FIX VOLUNTEERS TABLE - Run this in Supabase SQL Editor

-- Step 1: Drop the incorrect volunteers table
DROP TABLE IF EXISTS case_notes CASCADE;
DROP TABLE IF EXISTS case_assignments CASCADE;
DROP TABLE IF EXISTS volunteers CASCADE;

-- Step 2: Create volunteers table with correct schema
CREATE TABLE volunteers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'volunteer' CHECK (role IN ('volunteer', 'staff', 'admin')),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP
);

-- Step 3: Create case_assignments table
CREATE TABLE case_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transcript_id TEXT REFERENCES transcripts(id) ON DELETE CASCADE,
    volunteer_id UUID REFERENCES volunteers(id),
    assigned_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    notes TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'reassigned'))
);

-- Step 4: Create case_notes table
CREATE TABLE case_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transcript_id TEXT REFERENCES transcripts(id) ON DELETE CASCADE,
    volunteer_id UUID REFERENCES volunteers(id),
    note_text TEXT NOT NULL,
    note_type TEXT CHECK (note_type IN ('general', 'innocence_flag', 'bias_detected', 'follow_up')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Step 5: Add columns to transcripts table (if they don't exist)
ALTER TABLE transcripts 
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES volunteers(id),
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'unassigned' 
    CHECK (status IN ('unassigned', 'assigned', 'in_review', 'completed', 'flagged'));

-- Step 6: Insert 5 volunteer accounts
INSERT INTO volunteers (email, full_name, role) VALUES
    ('jordan.rivers@justicemap.org', 'Jordan Rivers', 'volunteer'),
    ('alex.chen@justicemap.org', 'Alex Chen', 'volunteer'),
    ('taylor.brooks@justicemap.org', 'Taylor Brooks', 'volunteer'),
    ('sam.martinez@justicemap.org', 'Sam Martinez', 'volunteer'),
    ('morgan.davis@justicemap.org', 'Morgan Davis', 'volunteer');

-- Step 7: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_transcripts_assigned_to ON transcripts(assigned_to);
CREATE INDEX IF NOT EXISTS idx_transcripts_status ON transcripts(status);
CREATE INDEX IF NOT EXISTS idx_case_assignments_transcript ON case_assignments(transcript_id);
CREATE INDEX IF NOT EXISTS idx_case_assignments_volunteer ON case_assignments(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_case_notes_transcript ON case_notes(transcript_id);

-- Step 8: Verify volunteers were created
SELECT * FROM volunteers;


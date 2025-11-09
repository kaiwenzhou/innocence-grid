-- JUSTICEMAP - VOLUNTEER AUTHENTICATION & CASE ASSIGNMENT
-- Add this to your existing Supabase database

-- ============================================
-- VOLUNTEERS TABLE
-- ============================================

-- Drop existing table if it has wrong schema
DROP TABLE IF EXISTS case_notes CASCADE;
DROP TABLE IF EXISTS case_assignments CASCADE;
DROP TABLE IF EXISTS volunteers CASCADE;

CREATE TABLE volunteers (
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

CREATE TABLE case_assignments (
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

CREATE TABLE case_notes (
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
    ('morgan.davis@justicemap.org', 'Morgan Davis', 'volunteer');

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_transcripts_assigned_to ON transcripts(assigned_to);
CREATE INDEX IF NOT EXISTS idx_transcripts_status ON transcripts(status);
CREATE INDEX IF NOT EXISTS idx_case_assignments_transcript ON case_assignments(transcript_id);
CREATE INDEX IF NOT EXISTS idx_case_assignments_volunteer ON case_assignments(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_case_notes_transcript ON case_notes(transcript_id);

-- ============================================
-- USEFUL QUERIES
-- ============================================

-- View all volunteer workloads
-- SELECT 
--     v.full_name,
--     COUNT(t.id) as assigned_cases,
--     COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_cases
-- FROM volunteers v
-- LEFT JOIN transcripts t ON t.assigned_to = v.id
-- GROUP BY v.id, v.full_name;

-- View unassigned cases
-- SELECT * FROM transcripts WHERE status = 'unassigned' OR assigned_to IS NULL;

-- View cases by volunteer
-- SELECT 
--     t.id,
--     t.inmate_name,
--     t.hearing_date,
--     t.status,
--     v.full_name as assigned_to
-- FROM transcripts t
-- LEFT JOIN volunteers v ON t.assigned_to = v.id
-- WHERE v.email = 'jordan.rivers@justicemap.org';


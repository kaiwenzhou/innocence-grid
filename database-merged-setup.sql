-- ============================================================================
-- JUSTICEMAP + INNOCENCE GRID - MERGED DATABASE SETUP
-- ============================================================================
-- This combines the innocence detection features from innocence-grid
-- with the volunteer management and commissioner analysis from JusticeMAP
--
-- Execute this entire file in your Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. VOLUNTEERS TABLE (Multi-User Support)
-- ============================================================================
-- Create this first since transcripts references it

CREATE TABLE IF NOT EXISTS volunteers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'volunteer' CHECK (role IN ('volunteer', 'staff', 'admin')),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP
);

-- ============================================================================
-- 2. CORE TRANSCRIPTS TABLE (Merged Schema)
-- ============================================================================

CREATE TABLE IF NOT EXISTS transcripts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    file_name TEXT NOT NULL,
    raw_text TEXT NOT NULL,

    -- Metadata extracted from filename/text (innocence-grid)
    hearing_date DATE,
    inmate_name TEXT,
    cdcr_number TEXT,

    -- Processing status (innocence-grid)
    processed BOOLEAN DEFAULT FALSE,
    uploaded_at TIMESTAMP DEFAULT NOW(),

    -- Volunteer assignment fields (JusticeMAP)
    assigned_to UUID REFERENCES volunteers(id),
    assigned_at TIMESTAMP,
    status TEXT DEFAULT 'unassigned'
        CHECK (status IN ('unassigned', 'assigned', 'in_review', 'completed', 'flagged'))
);

-- ============================================================================
-- 3. PREDICTIONS TABLE (Innocence Detection Results)
-- ============================================================================

CREATE TABLE IF NOT EXISTS predictions (
    id SERIAL PRIMARY KEY,
    transcript_id TEXT REFERENCES transcripts(id) ON DELETE CASCADE,

    -- Innocence analysis results
    innocence_score REAL,
    explicit_claims JSONB DEFAULT '[]',
    implicit_signals JSONB DEFAULT '[]',
    contextual_signals JSONB DEFAULT '[]',
    bias_language JSONB DEFAULT '[]',

    -- Model metadata
    model_version TEXT,
    analyzed_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(transcript_id, analyzed_at)
);

-- ============================================================================
-- 4. CASE ASSIGNMENTS TABLE (Assignment History)
-- ============================================================================

CREATE TABLE IF NOT EXISTS case_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transcript_id TEXT REFERENCES transcripts(id) ON DELETE CASCADE,
    volunteer_id UUID REFERENCES volunteers(id),
    assigned_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    notes TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'reassigned'))
);

-- ============================================================================
-- 5. CASE NOTES TABLE (Volunteer Annotations)
-- ============================================================================

CREATE TABLE IF NOT EXISTS case_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transcript_id TEXT REFERENCES transcripts(id) ON DELETE CASCADE,
    volunteer_id UUID REFERENCES volunteers(id),
    note_text TEXT NOT NULL,
    note_type TEXT CHECK (note_type IN ('general', 'innocence_flag', 'bias_detected', 'follow_up')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- 6. COMMISSIONERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS commissioners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Basic Info
    full_name TEXT NOT NULL UNIQUE,
    first_name TEXT,
    last_name TEXT,

    -- URLs and Images
    profile_url TEXT UNIQUE,
    photo_url TEXT,

    -- Biography and Background
    biography TEXT,
    appointment_date DATE,
    term_end_date DATE,

    -- Professional Background
    previous_roles JSONB DEFAULT '[]',
    education JSONB DEFAULT '[]',
    specializations TEXT[],

    -- Contact and Status
    email TEXT,
    phone TEXT,
    office_location TEXT,
    active BOOLEAN DEFAULT TRUE,

    -- Metadata
    data_source TEXT DEFAULT 'https://www.cdcr.ca.gov/bph/commissioners/',
    last_scraped_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- 7. COMMISSIONER HEARINGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS commissioner_hearings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commissioner_id UUID REFERENCES commissioners(id) ON DELETE CASCADE,
    transcript_id TEXT REFERENCES transcripts(id) ON DELETE CASCADE,

    -- Hearing Details
    hearing_date DATE,
    hearing_type TEXT CHECK (hearing_type IN ('parole_suitability', 'youth_offender', 'elderly', 'medical')),
    hearing_outcome TEXT,

    -- Analysis
    decision_rationale TEXT,
    bias_indicators JSONB DEFAULT '[]',

    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(commissioner_id, transcript_id)
);

-- ============================================================================
-- 8. COMMISSIONER STATISTICS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS commissioner_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commissioner_id UUID REFERENCES commissioners(id) ON DELETE CASCADE UNIQUE,

    -- Hearing Statistics
    total_hearings INTEGER DEFAULT 0,
    total_grants INTEGER DEFAULT 0,
    total_denials INTEGER DEFAULT 0,
    grant_rate DECIMAL(5,2),

    -- Case Categories
    innocence_claims_reviewed INTEGER DEFAULT 0,
    high_bias_cases INTEGER DEFAULT 0,

    -- Temporal Data
    avg_hearing_duration_minutes INTEGER,

    last_calculated_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- 9. INDEXES FOR PERFORMANCE
-- ============================================================================

-- Transcripts indexes
CREATE INDEX IF NOT EXISTS idx_transcripts_processed ON transcripts(processed);
CREATE INDEX IF NOT EXISTS idx_transcripts_assigned_to ON transcripts(assigned_to);
CREATE INDEX IF NOT EXISTS idx_transcripts_status ON transcripts(status);
CREATE INDEX IF NOT EXISTS idx_transcripts_hearing_date ON transcripts(hearing_date);

-- Predictions indexes
CREATE INDEX IF NOT EXISTS idx_predictions_transcript ON predictions(transcript_id);
CREATE INDEX IF NOT EXISTS idx_predictions_score ON predictions(innocence_score);

-- Volunteers indexes
CREATE INDEX IF NOT EXISTS idx_volunteers_email ON volunteers(email);
CREATE INDEX IF NOT EXISTS idx_volunteers_active ON volunteers(active);

-- Case assignments indexes
CREATE INDEX IF NOT EXISTS idx_case_assignments_transcript ON case_assignments(transcript_id);
CREATE INDEX IF NOT EXISTS idx_case_assignments_volunteer ON case_assignments(volunteer_id);

-- Case notes indexes
CREATE INDEX IF NOT EXISTS idx_case_notes_transcript ON case_notes(transcript_id);
CREATE INDEX IF NOT EXISTS idx_case_notes_volunteer ON case_notes(volunteer_id);

-- Commissioner indexes
CREATE INDEX IF NOT EXISTS idx_commissioners_name ON commissioners(full_name);
CREATE INDEX IF NOT EXISTS idx_commissioners_active ON commissioners(active);
CREATE INDEX IF NOT EXISTS idx_commissioner_hearings_commissioner ON commissioner_hearings(commissioner_id);
CREATE INDEX IF NOT EXISTS idx_commissioner_hearings_transcript ON commissioner_hearings(transcript_id);

-- ============================================================================
-- 10. INITIAL DATA
-- ============================================================================

-- Insert sample volunteers
INSERT INTO volunteers (email, full_name, role) VALUES
    ('jordan.rivers@justicemap.org', 'Jordan Rivers', 'volunteer'),
    ('alex.chen@justicemap.org', 'Alex Chen', 'volunteer'),
    ('taylor.brooks@justicemap.org', 'Taylor Brooks', 'volunteer'),
    ('sam.martinez@justicemap.org', 'Sam Martinez', 'volunteer'),
    ('morgan.davis@justicemap.org', 'Morgan Davis', 'volunteer')
ON CONFLICT (email) DO NOTHING;

-- Insert California BPH Commissioners
INSERT INTO commissioners (full_name, profile_url, active) VALUES
    ('Robert Barton', 'https://www.cdcr.ca.gov/bph/commissioners/', true),
    ('Patricia Cassady', 'https://www.cdcr.ca.gov/bph/commissioners/', true),
    ('Kevin Chappell', 'https://www.cdcr.ca.gov/bph/commissioners/', true),
    ('Dianne Dobbs', 'https://www.cdcr.ca.gov/bph/commissioners/', true),
    ('Julie Garland', 'https://www.cdcr.ca.gov/bph/commissioners/', true),
    ('Gilbert Infante', 'https://www.cdcr.ca.gov/bph/commissioners/', true),
    ('Teal Kozel', 'https://www.cdcr.ca.gov/bph/commissioners/', true),
    ('David Long', 'https://www.cdcr.ca.gov/bph/commissioners/', true),
    ('Michele Minor', 'https://www.cdcr.ca.gov/bph/commissioners/', true),
    ('William Muniz', 'https://www.cdcr.ca.gov/bph/commissioners/', true),
    ('David Ndudim', 'https://www.cdcr.ca.gov/bph/commissioners/', true),
    ('Kathleen O''Meara', 'https://www.cdcr.ca.gov/bph/commissioners/', true),
    ('Catherine Purcell', 'https://www.cdcr.ca.gov/bph/commissioners/', true),
    ('Michael Ruff', 'https://www.cdcr.ca.gov/bph/commissioners/', true),
    ('Rosalind Sargent-Burns', 'https://www.cdcr.ca.gov/bph/commissioners/', true),
    ('Neil Schneider', 'https://www.cdcr.ca.gov/bph/commissioners/', true),
    ('Excel Sharrieff', 'https://www.cdcr.ca.gov/bph/commissioners/', true),
    ('Emily Sheffield', 'https://www.cdcr.ca.gov/bph/commissioners/', true),
    ('Troy Taira', 'https://www.cdcr.ca.gov/bph/commissioners/', true),
    ('Mary Thornton', 'https://www.cdcr.ca.gov/bph/commissioners/', true),
    ('Jack Weiss', 'https://www.cdcr.ca.gov/bph/commissioners/', true)
ON CONFLICT (full_name) DO NOTHING;

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================
-- Your database now supports:
-- ✓ Transcript upload and storage
-- ✓ AI-powered innocence detection (Gemini integration)
-- ✓ Multi-user volunteer management
-- ✓ Case assignment workflow
-- ✓ Commissioner tracking and analysis
-- ✓ Bias detection and pattern insights
-- ============================================================================

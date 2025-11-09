-- ============================================
-- COMMISSIONERS DATABASE SETUP
-- ============================================
-- This creates tables to store California BPH Commissioner information
-- scraped from https://www.cdcr.ca.gov/bph/commissioners/

-- ============================================
-- COMMISSIONERS TABLE
-- ============================================

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
    previous_roles JSONB DEFAULT '[]', -- Array of previous positions
    education JSONB DEFAULT '[]', -- Array of educational background
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

-- ============================================
-- COMMISSIONER HEARINGS TABLE (Track hearing assignments)
-- ============================================

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

-- ============================================
-- COMMISSIONER STATISTICS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS commissioner_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commissioner_id UUID REFERENCES commissioners(id) ON DELETE CASCADE UNIQUE,
    
    -- Hearing Statistics
    total_hearings INTEGER DEFAULT 0,
    total_grants INTEGER DEFAULT 0,
    total_denials INTEGER DEFAULT 0,
    grant_rate DECIMAL(5,2), -- Percentage
    
    -- Case Categories
    innocence_claims_reviewed INTEGER DEFAULT 0,
    high_bias_cases INTEGER DEFAULT 0,
    
    -- Temporal Data
    avg_hearing_duration_minutes INTEGER,
    
    last_calculated_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_commissioners_name ON commissioners(full_name);
CREATE INDEX IF NOT EXISTS idx_commissioners_active ON commissioners(active);
CREATE INDEX IF NOT EXISTS idx_commissioners_last_scraped ON commissioners(last_scraped_at);
CREATE INDEX IF NOT EXISTS idx_commissioner_hearings_commissioner ON commissioner_hearings(commissioner_id);
CREATE INDEX IF NOT EXISTS idx_commissioner_hearings_transcript ON commissioner_hearings(transcript_id);
CREATE INDEX IF NOT EXISTS idx_commissioner_hearings_date ON commissioner_hearings(hearing_date);

-- ============================================
-- INITIAL COMMISSIONER DATA (From website)
-- ============================================
-- Based on current commissioners as of the website

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

-- ============================================
-- USEFUL QUERIES
-- ============================================

-- View all active commissioners
-- SELECT * FROM commissioners WHERE active = true ORDER BY full_name;

-- View commissioner grant rates
-- SELECT 
--     c.full_name,
--     s.total_hearings,
--     s.total_grants,
--     s.total_denials,
--     s.grant_rate
-- FROM commissioners c
-- LEFT JOIN commissioner_statistics s ON c.id = s.commissioner_id
-- ORDER BY s.grant_rate DESC;

-- Find commissioners with high bias cases
-- SELECT 
--     c.full_name,
--     s.high_bias_cases,
--     s.total_hearings,
--     ROUND((s.high_bias_cases::decimal / NULLIF(s.total_hearings, 0)) * 100, 2) as bias_percentage
-- FROM commissioners c
-- LEFT JOIN commissioner_statistics s ON c.id = s.commissioner_id
-- WHERE s.high_bias_cases > 0
-- ORDER BY bias_percentage DESC;

-- View commissioners needing data refresh (not scraped in last 30 days)
-- SELECT full_name, last_scraped_at 
-- FROM commissioners 
-- WHERE last_scraped_at IS NULL 
--    OR last_scraped_at < NOW() - INTERVAL '30 days'
-- ORDER BY last_scraped_at ASC NULLS FIRST;


-- ============================================
-- COMPLETE COMMISSIONERS DATABASE SETUP WITH DATA
-- ============================================
-- This script creates all tables AND populates commissioner background data
-- Run this ONCE in your Supabase SQL Editor

-- ============================================
-- 1. CREATE COMMISSIONERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS commissioners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Info
    full_name TEXT NOT NULL UNIQUE,
    first_name TEXT,
    last_name TEXT,
    
    -- URLs and Images
    profile_url TEXT,
    photo_url TEXT,
    
    -- Biography and Background
    biography TEXT,
    background_category TEXT,
    background_details TEXT,
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

-- ============================================
-- 2. CREATE COMMISSIONER HEARINGS TABLE
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
-- 3. CREATE COMMISSIONER STATISTICS TABLE
-- ============================================

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

-- ============================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_commissioners_name ON commissioners(full_name);
CREATE INDEX IF NOT EXISTS idx_commissioners_last_name ON commissioners(last_name);
CREATE INDEX IF NOT EXISTS idx_commissioners_active ON commissioners(active);
CREATE INDEX IF NOT EXISTS idx_commissioners_last_scraped ON commissioners(last_scraped_at);
CREATE INDEX IF NOT EXISTS idx_commissioner_hearings_commissioner ON commissioner_hearings(commissioner_id);
CREATE INDEX IF NOT EXISTS idx_commissioner_hearings_transcript ON commissioner_hearings(transcript_id);
CREATE INDEX IF NOT EXISTS idx_commissioner_hearings_date ON commissioner_hearings(hearing_date);

-- ============================================
-- 5. INSERT ALL 21 ACTIVE COMMISSIONERS WITH COMPLETE DATA
-- ============================================

INSERT INTO commissioners (
    full_name, 
    first_name, 
    last_name, 
    background_category, 
    background_details, 
    active, 
    profile_url
) VALUES
    -- Robert Barton
    ('Robert Barton', 'Robert', 'Barton', 
     'Legal, Judicial & Mixed Legal', 
     'Commissioner biography available on CDCR website.', 
     true, 'https://www.cdcr.ca.gov/bph/commissioners/'),
    
    -- Patricia Cassady
    ('Patricia Cassady', 'Patricia', 'Cassady', 
     'Parole Board Administration', 
     'Long-term BPH experience since 1995. Deputy Commissioner, Chief Deputy Commissioner.', 
     true, 'https://www.cdcr.ca.gov/bph/commissioners/'),
    
    -- Kevin Chappell
    ('Kevin Chappell', 'Kevin', 'Chappell', 
     'Corrections & Law Enforcement', 
     'Warden at San Quentin, Chief Deputy Warden at Folsom. 30+ years corrections.', 
     true, 'https://www.cdcr.ca.gov/bph/commissioners/'),
    
    -- Dianne Dobbs
    ('Dianne Dobbs', 'Dianne', 'Dobbs', 
     'Legal, Judicial & Mixed Legal', 
     'Attorney for Sacramento Child Advocates Inc. Senior Staff Counsel at Department of Consumer Affairs.', 
     true, 'https://www.cdcr.ca.gov/bph/commissioners/'),
    
    -- Julie Garland
    ('Julie Garland', 'Julie', 'Garland', 
     'Prosecution & State''s Attorney', 
     'Senior Assistant Attorney General. 20+ years at AG office.', 
     true, 'https://www.cdcr.ca.gov/bph/commissioners/'),
    
    -- Gilbert Infante
    ('Gilbert Infante', 'Gilbert', 'Infante', 
     'Corrections & Law Enforcement', 
     'Commissioner for Board of Juvenile Hearings. Treatment Team Supervisor, Youth Correctional Counselor.', 
     true, 'https://www.cdcr.ca.gov/bph/commissioners/'),
    
    -- Teal Kozel
    ('Teal Kozel', 'Teal', 'Kozel', 
     'Mental Health', 
     'Senior Psychologist Supervisor, Doctor of Psychology in Clinical Psychology.', 
     true, 'https://www.cdcr.ca.gov/bph/commissioners/'),
    
    -- David Long
    ('David Long', 'David', 'Long', 
     'Corrections & Law Enforcement', 
     'Warden at California City and Ironwood. VP of Prison Engagement at Defy Ventures.', 
     true, 'https://www.cdcr.ca.gov/bph/commissioners/'),
    
    -- Michele Minor
    ('Michele Minor', 'Michele', 'Minor', 
     'Corrections & Law Enforcement', 
     'Deputy Director of Rehabilitative Programs. 30+ years in corrections.', 
     true, 'https://www.cdcr.ca.gov/bph/commissioners/'),
    
    -- William Muniz
    ('William Muniz', 'William', 'Muniz', 
     'Corrections & Law Enforcement', 
     'Warden at Salinas Valley State Prison. Chief Deputy Administrator.', 
     true, 'https://www.cdcr.ca.gov/bph/commissioners/'),
    
    -- David Ndudim
    ('David Ndudim', 'David', 'Ndudim', 
     'Legal, Judicial & Mixed Legal', 
     'Temporary Superior Court Judge. Attorney in private practice.', 
     true, 'https://www.cdcr.ca.gov/bph/commissioners/'),
    
    -- Kathleen O'Meara
    ('Kathleen O''Meara', 'Kathleen', 'O''Meara', 
     'Mental Health', 
     'Regional Mental Health Administrator. Clinical and Forensic Psychologist.', 
     true, 'https://www.cdcr.ca.gov/bph/commissioners/'),
    
    -- Catherine Purcell
    ('Catherine Purcell', 'Catherine', 'Purcell', 
     'Prosecution & State''s Attorney', 
     'Deputy District Attorney in Kern County. Former Superior Court Judge.', 
     true, 'https://www.cdcr.ca.gov/bph/commissioners/'),
    
    -- Michael Ruff
    ('Michael Ruff', 'Michael', 'Ruff', 
     'Corrections & Law Enforcement', 
     'Former warden at San Quentin (12.5 years) and DVI (5 years). Career correctional officer background.', 
     true, 'https://www.cdcr.ca.gov/bph/commissioners/'),
    
    -- Rosalind Sargent-Burns
    ('Rosalind Sargent-Burns', 'Rosalind', 'Sargent-Burns', 
     'Legal, Judicial & Mixed Legal', 
     'Commissioner biography available on CDCR website.', 
     true, 'https://www.cdcr.ca.gov/bph/commissioners/'),
    
    -- Neil Schneider
    ('Neil Schneider', 'Neil', 'Schneider', 
     'Corrections & Law Enforcement', 
     'Police Captain at Sacramento Police Department. 34 years law enforcement.', 
     true, 'https://www.cdcr.ca.gov/bph/commissioners/'),
    
    -- Excel Sharrieff
    ('Excel Sharrieff', 'Excel', 'Sharrieff', 
     'Legal, Judicial & Mixed Legal', 
     'Attorney in private practice. Judge Pro Tem.', 
     true, 'https://www.cdcr.ca.gov/bph/commissioners/'),
    
    -- Emily Sheffield
    ('Emily Sheffield', 'Emily', 'Sheffield', 
     'Legal, Judicial & Mixed Legal', 
     'Senior Appellate Attorney. Volunteer for the Exoneration Project.', 
     true, 'https://www.cdcr.ca.gov/bph/commissioners/'),
    
    -- Troy Taira
    ('Troy Taira', 'Troy', 'Taira', 
     'Legal, Judicial & Mixed Legal', 
     'Defense Attorney in Fresno County Public Defender''s Office. Multiple ALJ roles.', 
     true, 'https://www.cdcr.ca.gov/bph/commissioners/'),
    
    -- Mary Thornton
    ('Mary Thornton', 'Mary', 'Thornton', 
     'Prosecution & State''s Attorney', 
     'Deputy District Attorney in Madera and Kings Counties.', 
     true, 'https://www.cdcr.ca.gov/bph/commissioners/'),
    
    -- Jack Weiss
    ('Jack Weiss', 'Jack', 'Weiss', 
     'Prosecution & State''s Attorney', 
     'Assistant U.S. Attorney. LA City Council chair of Public Safety Committee.', 
     true, 'https://www.cdcr.ca.gov/bph/commissioners/'),
    
    -- Deputy Commissioners (often appear in transcripts)
    ('Neal Chambers', 'Neal', 'Chambers', 
     'Legal, Judicial & Mixed Legal', 
     'Deputy Commissioner. Background information available on CDCR website.', 
     true, 'https://www.cdcr.ca.gov/bph/commissioners/'),
    
    ('Others Present', NULL, NULL, 
     'Deputy Commissioner', 
     'Generic placeholder for deputy commissioners not individually named in transcripts.', 
     true, 'https://www.cdcr.ca.gov/bph/commissioners/')
ON CONFLICT (full_name) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    background_category = EXCLUDED.background_category,
    background_details = EXCLUDED.background_details,
    profile_url = EXCLUDED.profile_url,
    updated_at = NOW();

-- ============================================
-- 6. VERIFY INSTALLATION
-- ============================================

-- Show all commissioners with their backgrounds
SELECT 
    full_name,
    background_category,
    LEFT(background_details, 60) as background_preview
FROM commissioners
WHERE active = true
ORDER BY full_name;

-- Count by category
SELECT 
    background_category,
    COUNT(*) as commissioner_count
FROM commissioners
WHERE active = true
GROUP BY background_category
ORDER BY commissioner_count DESC;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
-- If you see the results above, your commissioners database is ready!
-- Total: 23 commissioner records (21 active commissioners + 2 deputy entries)


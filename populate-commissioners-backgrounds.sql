-- ============================================
-- POPULATE COMMISSIONER BACKGROUNDS
-- ============================================
-- This script adds background information for all 21 California BPH Commissioners
-- Run this in your Supabase SQL Editor after running database-commissioners-setup.sql

-- ============================================
-- 1. ADD BACKGROUND COLUMNS IF NOT EXISTS
-- ============================================

ALTER TABLE commissioners 
ADD COLUMN IF NOT EXISTS background_category TEXT,
ADD COLUMN IF NOT EXISTS background_details TEXT;

-- ============================================
-- 2. UPDATE ALL COMMISSIONERS WITH BACKGROUND DATA
-- ============================================

-- Robert Barton (NEW - not in original hardcoded list)
UPDATE commissioners 
SET background_category = 'Legal, Judicial & Mixed Legal',
    background_details = 'Commissioner biography available on CDCR website.',
    last_name = 'Barton',
    first_name = 'Robert'
WHERE full_name = 'Robert Barton';

-- Patricia Cassady
UPDATE commissioners 
SET background_category = 'Parole Board Administration',
    background_details = 'Long-term BPH experience since 1995. Deputy Commissioner, Chief Deputy Commissioner.',
    last_name = 'Cassady',
    first_name = 'Patricia'
WHERE full_name = 'Patricia Cassady';

-- Kevin Chappell
UPDATE commissioners 
SET background_category = 'Corrections & Law Enforcement',
    background_details = 'Warden at San Quentin, Chief Deputy Warden at Folsom. 30+ years corrections.',
    last_name = 'Chappell',
    first_name = 'Kevin'
WHERE full_name = 'Kevin Chappell';

-- Dianne Dobbs
UPDATE commissioners 
SET background_category = 'Legal, Judicial & Mixed Legal',
    background_details = 'Attorney for Sacramento Child Advocates Inc. Senior Staff Counsel at Department of Consumer Affairs.',
    last_name = 'Dobbs',
    first_name = 'Dianne'
WHERE full_name = 'Dianne Dobbs';

-- Julie Garland
UPDATE commissioners 
SET background_category = 'Prosecution & State''s Attorney',
    background_details = 'Senior Assistant Attorney General. 20+ years at AG office.',
    last_name = 'Garland',
    first_name = 'Julie'
WHERE full_name = 'Julie Garland';

-- Gilbert Infante
UPDATE commissioners 
SET background_category = 'Corrections & Law Enforcement',
    background_details = 'Commissioner for Board of Juvenile Hearings. Treatment Team Supervisor, Youth Correctional Counselor.',
    last_name = 'Infante',
    first_name = 'Gilbert'
WHERE full_name = 'Gilbert Infante';

-- Teal Kozel
UPDATE commissioners 
SET background_category = 'Mental Health',
    background_details = 'Senior Psychologist Supervisor, Doctor of Psychology in Clinical Psychology.',
    last_name = 'Kozel',
    first_name = 'Teal'
WHERE full_name = 'Teal Kozel';

-- David Long
UPDATE commissioners 
SET background_category = 'Corrections & Law Enforcement',
    background_details = 'Warden at California City and Ironwood. VP of Prison Engagement at Defy Ventures.',
    last_name = 'Long',
    first_name = 'David'
WHERE full_name = 'David Long';

-- Michele Minor
UPDATE commissioners 
SET background_category = 'Corrections & Law Enforcement',
    background_details = 'Deputy Director of Rehabilitative Programs. 30+ years in corrections.',
    last_name = 'Minor',
    first_name = 'Michele'
WHERE full_name = 'Michele Minor';

-- William Muniz
UPDATE commissioners 
SET background_category = 'Corrections & Law Enforcement',
    background_details = 'Warden at Salinas Valley State Prison. Chief Deputy Administrator.',
    last_name = 'Muniz',
    first_name = 'William'
WHERE full_name = 'William Muniz';

-- David Ndudim
UPDATE commissioners 
SET background_category = 'Legal, Judicial & Mixed Legal',
    background_details = 'Temporary Superior Court Judge. Attorney in private practice.',
    last_name = 'Ndudim',
    first_name = 'David'
WHERE full_name = 'David Ndudim';

-- Kathleen O'Meara
UPDATE commissioners 
SET background_category = 'Mental Health',
    background_details = 'Regional Mental Health Administrator. Clinical and Forensic Psychologist.',
    last_name = 'O''Meara',
    first_name = 'Kathleen'
WHERE full_name = 'Kathleen O''Meara';

-- Catherine Purcell
UPDATE commissioners 
SET background_category = 'Prosecution & State''s Attorney',
    background_details = 'Deputy District Attorney in Kern County. Former Superior Court Judge.',
    last_name = 'Purcell',
    first_name = 'Catherine'
WHERE full_name = 'Catherine Purcell';

-- Michael Ruff
UPDATE commissioners 
SET background_category = 'Corrections & Law Enforcement',
    background_details = 'Former warden at San Quentin (12.5 years) and DVI (5 years). Career correctional officer background.',
    last_name = 'Ruff',
    first_name = 'Michael'
WHERE full_name = 'Michael Ruff';

-- Rosalind Sargent-Burns (NEW - not in original hardcoded list)
UPDATE commissioners 
SET background_category = 'Legal, Judicial & Mixed Legal',
    background_details = 'Commissioner biography available on CDCR website.',
    last_name = 'Sargent-Burns',
    first_name = 'Rosalind'
WHERE full_name = 'Rosalind Sargent-Burns';

-- Neil Schneider
UPDATE commissioners 
SET background_category = 'Corrections & Law Enforcement',
    background_details = 'Police Captain at Sacramento Police Department. 34 years law enforcement.',
    last_name = 'Schneider',
    first_name = 'Neil'
WHERE full_name = 'Neil Schneider';

-- Excel Sharrieff
UPDATE commissioners 
SET background_category = 'Legal, Judicial & Mixed Legal',
    background_details = 'Attorney in private practice. Judge Pro Tem.',
    last_name = 'Sharrieff',
    first_name = 'Excel'
WHERE full_name = 'Excel Sharrieff';

-- Emily Sheffield
UPDATE commissioners 
SET background_category = 'Legal, Judicial & Mixed Legal',
    background_details = 'Senior Appellate Attorney. Volunteer for the Exoneration Project.',
    last_name = 'Sheffield',
    first_name = 'Emily'
WHERE full_name = 'Emily Sheffield';

-- Troy Taira
UPDATE commissioners 
SET background_category = 'Legal, Judicial & Mixed Legal',
    background_details = 'Defense Attorney in Fresno County Public Defender''s Office. Multiple ALJ roles.',
    last_name = 'Taira',
    first_name = 'Troy'
WHERE full_name = 'Troy Taira';

-- Mary Thornton
UPDATE commissioners 
SET background_category = 'Prosecution & State''s Attorney',
    background_details = 'Deputy District Attorney in Madera and Kings Counties.',
    last_name = 'Thornton',
    first_name = 'Mary'
WHERE full_name = 'Mary Thornton';

-- Jack Weiss
UPDATE commissioners 
SET background_category = 'Prosecution & State''s Attorney',
    background_details = 'Assistant U.S. Attorney. LA City Council chair of Public Safety Committee.',
    last_name = 'Weiss',
    first_name = 'Jack'
WHERE full_name = 'Jack Weiss';

-- ============================================
-- 3. ADD COMMON DEPUTY COMMISSIONERS (often seen in transcripts)
-- ============================================

INSERT INTO commissioners (full_name, first_name, last_name, background_category, background_details, active, profile_url) 
VALUES 
    ('Neal Chambers', 'Neal', 'Chambers', 'Legal, Judicial & Mixed Legal', 'Deputy Commissioner. Background information available on CDCR website.', true, 'https://www.cdcr.ca.gov/bph/commissioners/'),
    ('Others Present', NULL, NULL, 'Deputy Commissioner', 'Generic placeholder for deputy commissioners not individually named in transcripts.', true, 'https://www.cdcr.ca.gov/bph/commissioners/')
ON CONFLICT (full_name) DO UPDATE SET
    background_category = EXCLUDED.background_category,
    background_details = EXCLUDED.background_details,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name;

-- ============================================
-- 4. VERIFY DATA
-- ============================================

-- Check all commissioners now have background data
SELECT 
    full_name,
    background_category,
    LEFT(background_details, 50) as background_preview,
    active
FROM commissioners
ORDER BY full_name;

-- Count by category
SELECT 
    background_category,
    COUNT(*) as count
FROM commissioners
WHERE active = true
GROUP BY background_category
ORDER BY count DESC;

-- Show any commissioners still missing background info
SELECT full_name, background_category, background_details
FROM commissioners
WHERE background_category IS NULL OR background_details IS NULL;


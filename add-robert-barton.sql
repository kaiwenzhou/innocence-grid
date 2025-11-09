-- ============================================
-- ADD/UPDATE COMMISSIONER ROBERT BARTON WITH CDCR PROFILE
-- ============================================
-- Run this in Supabase SQL Editor

-- Insert or Update Robert Barton with complete information
INSERT INTO commissioners (
    full_name,
    first_name,
    last_name,
    profile_url,
    biography,
    background_category,
    background_details,
    appointment_date,
    previous_roles,
    education,
    specializations,
    active,
    data_source
) VALUES (
    'ROBERT BARTON',
    'Robert',
    'Barton',
    'https://www.cdcr.ca.gov/bph/commissioners/commissioner-robert-barton/',
    'Robert Barton was appointed to the Board of Parole Hearings by Governor Brown on August 10, 2017. Barton held several positions in the Office of the Inspector General from 2005 to 2017, including inspector general and assistant inspector general. Barton was supervising deputy district attorney at the Kern County District Attorney''s Office from 2000 to 2005, where he served as a deputy district attorney from 1988 to 2000. Commissioner Barton was reappointed to the Board of Parole Hearings by Governor Newsom on August 22, 2023.',
    'Legal, Judicial & Mixed Legal',
    'Former Inspector General (OIG), former Deputy District Attorney and Supervising Deputy DA at Kern County DA''s Office. Legal and prosecutorial background with oversight experience.',
    '2017-08-10',
    '[
        {
            "title": "Inspector General",
            "organization": "Office of the Inspector General",
            "start_date": "2005",
            "end_date": "2017",
            "description": "Held several positions including Inspector General and Assistant Inspector General"
        },
        {
            "title": "Supervising Deputy District Attorney",
            "organization": "Kern County District Attorney''s Office",
            "start_date": "2000",
            "end_date": "2005"
        },
        {
            "title": "Deputy District Attorney",
            "organization": "Kern County District Attorney''s Office",
            "start_date": "1988",
            "end_date": "2000"
        }
    ]'::jsonb,
    '[
        {
            "degree": "Juris Doctor (J.D.)",
            "institution": "University of California, Davis School of Law",
            "field": "Law"
        }
    ]'::jsonb,
    ARRAY['Prosecutorial Experience', 'Government Oversight', 'Criminal Law', 'Legal Prosecution'],
    true,
    'https://www.cdcr.ca.gov/bph/commissioners/commissioner-robert-barton/'
)
ON CONFLICT (full_name) 
DO UPDATE SET
    first_name = 'Robert',
    last_name = 'Barton',
    profile_url = 'https://www.cdcr.ca.gov/bph/commissioners/commissioner-robert-barton/',
    biography = 'Robert Barton was appointed to the Board of Parole Hearings by Governor Brown on August 10, 2017. Barton held several positions in the Office of the Inspector General from 2005 to 2017, including inspector general and assistant inspector general. Barton was supervising deputy district attorney at the Kern County District Attorney''s Office from 2000 to 2005, where he served as a deputy district attorney from 1988 to 2000. Commissioner Barton was reappointed to the Board of Parole Hearings by Governor Newsom on August 22, 2023.',
    background_category = 'Legal, Judicial & Mixed Legal',
    background_details = 'Former Inspector General (OIG), former Deputy District Attorney and Supervising Deputy DA at Kern County DA''s Office. Legal and prosecutorial background with oversight experience.',
    appointment_date = '2017-08-10',
    previous_roles = '[
        {
            "title": "Inspector General",
            "organization": "Office of the Inspector General",
            "start_date": "2005",
            "end_date": "2017",
            "description": "Held several positions including Inspector General and Assistant Inspector General"
        },
        {
            "title": "Supervising Deputy District Attorney",
            "organization": "Kern County District Attorney''s Office",
            "start_date": "2000",
            "end_date": "2005"
        },
        {
            "title": "Deputy District Attorney",
            "organization": "Kern County District Attorney''s Office",
            "start_date": "1988",
            "end_date": "2000"
        }
    ]'::jsonb,
    education = '[
        {
            "degree": "Juris Doctor (J.D.)",
            "institution": "University of California, Davis School of Law",
            "field": "Law"
        }
    ]'::jsonb,
    specializations = ARRAY['Prosecutorial Experience', 'Government Oversight', 'Criminal Law', 'Legal Prosecution'],
    active = true,
    data_source = 'https://www.cdcr.ca.gov/bph/commissioners/commissioner-robert-barton/',
    updated_at = NOW();

-- Verify the insert/update
SELECT 
    full_name,
    first_name,
    last_name,
    profile_url,
    background_category,
    appointment_date,
    active
FROM commissioners
WHERE full_name = 'ROBERT BARTON';


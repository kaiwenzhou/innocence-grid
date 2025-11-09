-- ============================================
-- ADD COMMISSIONER BRENNA KANTROVITZ WITH LINKEDIN
-- ============================================
-- Run this in Supabase SQL Editor to add/update Brenna Kantrovitz

-- Insert or Update Brenna Kantrovitz with LinkedIn profile
INSERT INTO commissioners (
    full_name,
    first_name,
    last_name,
    profile_url,
    background_category,
    background_details,
    active,
    data_source
) VALUES (
    'BRENNA KANTROVITZ',
    'Brenna',
    'Kantrovitz',
    'https://www.linkedin.com/in/brenna-hall-kantrovitz-6a098ab3/',
    'Unknown Background',
    'Background information pending research. LinkedIn profile available.',
    true,
    'LinkedIn'
)
ON CONFLICT (full_name) 
DO UPDATE SET
    profile_url = 'https://www.linkedin.com/in/brenna-hall-kantrovitz-6a098ab3/',
    first_name = 'Brenna',
    last_name = 'Kantrovitz',
    background_category = 'Unknown Background',
    background_details = 'Background information pending research. LinkedIn profile available.',
    data_source = 'LinkedIn',
    updated_at = NOW();

-- Verify the insert/update
SELECT 
    full_name,
    profile_url,
    background_category,
    active
FROM commissioners
WHERE full_name = 'BRENNA KANTROVITZ';


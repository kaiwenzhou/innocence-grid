-- Create inmates table for CDCR inmate information
-- This table stores scraped data from the CDCR database
-- Run this migration in your Supabase SQL Editor

CREATE TABLE inmates (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    cdcr_number TEXT UNIQUE NOT NULL,
    name TEXT,
    age INTEGER,
    admission_date DATE,
    current_location TEXT,
    commitment_county TEXT,
    parole_eligible_date DATE,
    last_scraped_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create board_of_parole_hearings table for hearing history
CREATE TABLE board_of_parole_hearings (
    id SERIAL PRIMARY KEY,
    cdcr_number TEXT NOT NULL REFERENCES inmates(cdcr_number) ON DELETE CASCADE,
    hearing_date DATE,
    action TEXT,
    status TEXT,
    outcome TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_inmates_cdcr_number ON inmates(cdcr_number);
CREATE INDEX idx_inmates_name ON inmates(name);
CREATE INDEX idx_parole_hearings_cdcr ON board_of_parole_hearings(cdcr_number);
CREATE INDEX idx_parole_hearings_date ON board_of_parole_hearings(hearing_date);

-- Create index on transcripts.cdcr_number for efficient joins
CREATE INDEX IF NOT EXISTS idx_transcripts_cdcr_number ON transcripts(cdcr_number);

-- Create a view for easy joining of transcripts with inmate data
CREATE OR REPLACE VIEW transcripts_with_inmates AS
SELECT
    t.*,
    i.name as inmate_name_verified,
    i.age as inmate_age,
    i.admission_date as inmate_admission_date,
    i.current_location as inmate_current_location,
    i.commitment_county as inmate_commitment_county,
    i.parole_eligible_date as inmate_parole_eligible_date,
    i.last_scraped_at as inmate_data_scraped_at
FROM transcripts t
LEFT JOIN inmates i ON t.cdcr_number = i.cdcr_number;

-- Add comment explaining the schema
COMMENT ON TABLE inmates IS 'Stores inmate information scraped from CDCR database';
COMMENT ON TABLE board_of_parole_hearings IS 'Stores Board of Parole Hearings action history for each inmate';
COMMENT ON VIEW transcripts_with_inmates IS 'Joins transcripts with scraped inmate information based on CDCR number';

# CDCR Inmate Scraper

This directory contains scripts for scraping inmate information from the California Department of Corrections and Rehabilitation (CDCR) database and populating your Supabase database.

## Overview

The scraper:
1. Fetches all unique CDCR numbers from your `transcripts` table
2. Scrapes the CDCR website for each inmate's information
3. Stores data in the `inmates` and `board_of_parole_hearings` tables
4. Automatically joins with transcripts via the `cdcr_number` field

## Setup

### 1. Database Migration

First, run the SQL migration to create the new tables:

1. Open your Supabase project dashboard
2. Go to the SQL Editor
3. Run the SQL file: `../migrations/create_inmates_table.sql`

This will create:
- `inmates` table - stores inmate personal information
- `board_of_parole_hearings` table - stores parole hearing history
- `transcripts_with_inmates` view - convenient join of transcripts + inmate data
- Necessary indexes for performance

### 2. Python Environment

Install Python dependencies:

```bash
cd scripts

# Create a virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install Playwright browsers
playwright install chromium
```

### 3. Environment Variables

Ensure your `.env` file in the project root contains:

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

The scraper will use these same environment variables to connect to Supabase.

## Usage

### Scrape All Transcripts

Scrape CDCR data for all transcripts with CDCR numbers:

```bash
python cdcr_scraper.py
```

This will:
- Fetch all unique CDCR numbers from `transcripts` table
- Skip any inmates that already have data in the database
- Display progress for each inmate
- Save data to Supabase

### Force Refresh

Re-scrape inmates even if data already exists:

```bash
python cdcr_scraper.py --force
```

### Scrape Single CDCR Number

Test with a specific CDCR number:

```bash
python cdcr_scraper.py --cdcr D54803
```

### Run in Visible Mode

Watch the browser scraping in action (useful for debugging):

```bash
python cdcr_scraper.py --visible
```

### Combine Options

```bash
python cdcr_scraper.py --force --visible --cdcr T97214
```

## Data Structure

### Inmates Table

Stores basic inmate information:
- `cdcr_number` - Primary identifier
- `name` - Inmate name
- `age` - Current age
- `admission_date` - Date admitted to CDCR
- `current_location` - Current prison/facility
- `commitment_county` - County of commitment
- `parole_eligible_date` - Date eligible for parole
- `last_scraped_at` - Last time data was scraped
- `created_at` / `updated_at` - Timestamps

### Board of Parole Hearings Table

Stores parole hearing history:
- `cdcr_number` - Links to inmate
- `hearing_date` - Date of hearing
- `action` - Action taken
- `status` - Current status
- `outcome` - Outcome of hearing

## Querying the Data

### Get Transcripts with Inmate Data

Use the convenient view:

```sql
SELECT * FROM transcripts_with_inmates
WHERE cdcr_number IS NOT NULL
ORDER BY uploaded_at DESC;
```

### Manual Join

```sql
SELECT
  t.id,
  t.file_name,
  t.cdcr_number,
  t.inmate_name,
  i.name as verified_name,
  i.age,
  i.current_location,
  i.parole_eligible_date
FROM transcripts t
LEFT JOIN inmates i ON t.cdcr_number = i.cdcr_number
WHERE t.cdcr_number IS NOT NULL;
```

### Get Parole Hearing History

```sql
SELECT
  t.file_name,
  t.inmate_name,
  h.hearing_date,
  h.action,
  h.status,
  h.outcome
FROM transcripts t
JOIN board_of_parole_hearings h ON t.cdcr_number = h.cdcr_number
ORDER BY h.hearing_date DESC;
```

## TypeScript Integration

The TypeScript types have been updated in `src/lib/types.ts`:

```typescript
import { Inmate, ParoleHearing, TranscriptWithInmate } from '@/lib/types';

// Fetch transcript with inmate data
const { data, error } = await supabase
  .from('transcripts_with_inmates')
  .select('*')
  .eq('id', transcriptId)
  .single();

// Fetch parole hearings for an inmate
const { data: hearings } = await supabase
  .from('board_of_parole_hearings')
  .select('*')
  .eq('cdcr_number', cdcrNumber)
  .order('hearing_date', { ascending: false });
```

## Troubleshooting

### No CDCR Numbers Found

If the scraper reports "No CDCR numbers found in transcripts table":
- Verify transcripts exist in your database
- Check that the `cdcr_number` field is populated
- The extraction pattern looks for "CDCR Number: [NUMBER]" in transcript text

### Scraping Errors

If scraping fails:
1. Run with `--visible` flag to see what's happening
2. Check your internet connection
3. Verify the CDCR website is accessible: https://ciris.mt.cdcr.ca.gov/
4. The website may have changed structure - selectors may need updating

### Database Connection Errors

If you get Supabase connection errors:
- Verify `.env` file contains correct credentials
- Check Supabase project is active
- Ensure anon key has permission to insert/update tables

## Production Considerations

### Scheduled Updates

For production use, consider scheduling regular updates:

```bash
# Add to crontab (run daily at 2 AM)
0 2 * * * cd /path/to/innocence-grid/scripts && /path/to/venv/bin/python cdcr_scraper.py
```

### Rate Limiting

The scraper includes 2-second delays between requests to be respectful of the CDCR website. Do not reduce these delays.

### Error Handling

The scraper continues on errors and reports them at the end. Check logs for any failed scrapes and retry manually if needed.

### Data Freshness

To keep data up-to-date:
- Run `--force` periodically to refresh all inmate data
- Last scrape time is tracked in `last_scraped_at` field
- Consider adding logic to only refresh data older than X days

## Future Enhancements

Potential improvements:
1. **Automatic scraping on upload** - Trigger scraper when new transcripts are uploaded
2. **UI integration** - Add "Fetch Inmate Data" button in the UI
3. **Background jobs** - Use a job queue for async scraping
4. **Incremental updates** - Only scrape inmates without recent data
5. **BrowserBase integration** - Use BrowserBase API for serverless scraping

## License

Same as the main project.

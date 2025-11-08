# CDCR Inmate Scraper Setup Guide

This guide walks you through setting up the CDCR inmate scraper to automatically fetch and populate inmate information from the California Department of Corrections and Rehabilitation database.

## Overview

The system consists of:

1. **Database Schema** - New tables for storing inmate and parole hearing data
2. **Python Scraper** - Automated web scraper using Playwright
3. **TypeScript Service** - Service layer for accessing inmate data in the React app
4. **React Components** - UI components for displaying inmate information

## Architecture

```
┌─────────────────┐
│   Transcripts   │  (Existing table with cdcr_number field)
└────────┬────────┘
         │
         │ cdcr_number
         │
         ├─────────────────────────────────┐
         │                                 │
         ▼                                 ▼
┌────────────────┐              ┌─────────────────────┐
│    Inmates     │              │ Parole Hearings     │
├────────────────┤              ├─────────────────────┤
│ cdcr_number*   │◄─────────────│ cdcr_number (FK)    │
│ name           │              │ hearing_date        │
│ age            │              │ action              │
│ admission_date │              │ status              │
│ current_loc    │              │ outcome             │
│ parole_elig_dt │              └─────────────────────┘
└────────────────┘

         │
         │ Convenient View
         ▼
┌──────────────────────────┐
│ transcripts_with_inmates │  (View joining transcripts + inmates)
└──────────────────────────┘
```

## Step-by-Step Setup

### Step 1: Database Migration

1. Open your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy the contents of `migrations/create_inmates_table.sql`
5. Execute the query

This creates:
- `inmates` table
- `board_of_parole_hearings` table
- Indexes for performance
- `transcripts_with_inmates` view for easy querying

**Verification:**

```sql
-- Check tables were created
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('inmates', 'board_of_parole_hearings');

-- Check the view
SELECT * FROM transcripts_with_inmates LIMIT 1;
```

### Step 2: Install Python Dependencies

```bash
# Navigate to scripts directory
cd scripts

# Create virtual environment (recommended)
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install Playwright browsers
playwright install chromium
```

**Verification:**

```bash
python -c "from playwright.sync_api import sync_playwright; print('Playwright installed!')"
python -c "from supabase import create_client; print('Supabase client installed!')"
```

### Step 3: Configure Environment Variables

Your `.env` file should already contain Supabase credentials:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

The Python scraper will use these same variables.

**Verification:**

```bash
python -c "from dotenv import load_dotenv; import os; load_dotenv(); print('Supabase URL:', os.getenv('VITE_SUPABASE_URL'))"
```

### Step 4: Test the Scraper

Test with a single CDCR number first:

```bash
# Run in visible mode to see what's happening
python cdcr_scraper.py --cdcr D54803 --visible
```

This will:
1. Open a Chrome browser window
2. Navigate to CDCR website
3. Search for the CDCR number
4. Extract inmate data
5. Save to your Supabase database
6. Print the results

**Expected output:**

```
Fetching CDCR numbers from transcripts table...
Found 1 unique CDCR numbers

[1/1] Processing CDCR number: D54803
  Navigating to CDCR website...
  Accepting disclaimer...
  Switching to CDCR Number search...
  Entering CDCR number: D54803
  Executing search...
  Extracting search results...
  Accessing detailed record...
  Extracting detailed information...
  ✓ Successfully extracted data for D54803
  Inserting new inmate record for D54803
  Inserting 5 parole hearing records

================================================================================
{
  "cdcr_number": "D54803",
  "name": "DOE, JOHN",
  "age": 45,
  ...
}
================================================================================
```

### Step 5: Run Full Scrape

Once testing is successful, scrape all transcripts:

```bash
# Scrape all unique CDCR numbers from transcripts
python cdcr_scraper.py

# Or run in headless mode (faster)
python cdcr_scraper.py
```

**Expected output:**

```
Fetching CDCR numbers from transcripts table...
Found 15 unique CDCR numbers

================================================================================
Starting CDCR scraping for 15 inmates
================================================================================

[1/15] Processing CDCR number: D54803
  ✓ Successfully extracted data for D54803

[2/15] Processing CDCR number: T97214
  ✓ Successfully extracted data for T97214

...

================================================================================
SCRAPING COMPLETE
================================================================================
Total CDCR numbers: 15
Successfully scraped: 15
Skipped (already exists): 0
Errors: 0
================================================================================
```

### Step 6: Verify Data in Supabase

Check the data was saved correctly:

```sql
-- Check inmates
SELECT count(*) FROM inmates;

-- Check parole hearings
SELECT count(*) FROM board_of_parole_hearings;

-- View sample inmate data
SELECT * FROM inmates LIMIT 5;

-- View transcripts with inmate data
SELECT
  t.file_name,
  t.cdcr_number,
  i.name,
  i.current_location,
  i.parole_eligible_date
FROM transcripts t
LEFT JOIN inmates i ON t.cdcr_number = i.cdcr_number
WHERE t.cdcr_number IS NOT NULL;
```

## Frontend Integration

### Step 7: Use in React Components

The scraper integrates seamlessly with your existing React app:

```typescript
import { InmateService } from '@/services/inmates';

// Fetch inmate data
const inmate = await InmateService.getInmateByCDCR('D54803');

// Fetch parole hearings
const hearings = await InmateService.getParoleHearings('D54803');

// Fetch transcript with inmate data
const transcript = await InmateService.getTranscriptWithInmate(transcriptId);
```

### Example: Update TranscriptDetail Page

```typescript
// src/pages/TranscriptDetail.tsx
import { InmateInfo } from '@/components/InmateInfo';

function TranscriptDetail() {
  const { id } = useParams();
  // ... existing code ...

  return (
    <div>
      {/* Existing transcript content */}

      {/* Add inmate information section */}
      {transcript?.cdcr_number && (
        <InmateInfo cdcrNumber={transcript.cdcr_number} />
      )}
    </div>
  );
}
```

### Step 8: Add to Dashboard Statistics

Update your dashboard to show inmate data coverage:

```typescript
import { InmateService } from '@/services/inmates';

async function getDashboardStats() {
  const coverage = await InmateService.getInmateDataCoverage();

  console.log(`Inmate data coverage: ${coverage.coveragePercentage}%`);
  console.log(`${coverage.transcriptsWithInmateData} of ${coverage.transcriptsWithCDCR} transcripts have inmate data`);
}
```

## Usage Patterns

### One-time Bulk Import

When you first set up the scraper:

```bash
python cdcr_scraper.py
```

### Periodic Updates

Re-scrape to update inmate data (e.g., new parole hearings):

```bash
# Force refresh all data
python cdcr_scraper.py --force
```

### Single Inmate Lookup

For testing or manual lookup:

```bash
python cdcr_scraper.py --cdcr D54803
```

### Scheduled Automation

Add to crontab for daily updates:

```bash
# Run daily at 2 AM
0 2 * * * cd /path/to/innocence-grid/scripts && /path/to/venv/bin/python cdcr_scraper.py
```

## Common Workflows

### Workflow 1: New Transcript Upload

When a user uploads a new transcript:

1. Transcript is parsed, CDCR number extracted
2. Transcript saved to database
3. *(Optional)* Trigger scraper to fetch inmate data immediately
4. Display inmate information on transcript detail page

### Workflow 2: Manual Refresh

When you want to update all inmate data:

```bash
python cdcr_scraper.py --force
```

### Workflow 3: Check Coverage

To see how many transcripts have inmate data:

```typescript
const coverage = await InmateService.getInmateDataCoverage();
console.log(`Coverage: ${coverage.coveragePercentage}%`);
```

## Troubleshooting

### Issue: No CDCR numbers found

**Cause:** No transcripts in database or CDCR numbers not extracted

**Solution:**
1. Check if transcripts exist: `SELECT count(*) FROM transcripts;`
2. Check CDCR extraction: `SELECT cdcr_number FROM transcripts WHERE cdcr_number IS NOT NULL;`
3. Verify extraction regex in `TranscriptService.extractMetadataFromContent()`

### Issue: Scraping fails

**Cause:** CDCR website changed or network issues

**Solution:**
1. Run with `--visible` flag to see the browser
2. Check if https://ciris.mt.cdcr.ca.gov/ is accessible
3. Update selectors in `cdcr_scraper.py` if website structure changed

### Issue: Database connection errors

**Cause:** Invalid Supabase credentials

**Solution:**
1. Verify `.env` file has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
2. Check Supabase project is active
3. Verify anon key has permissions for `inmates` and `board_of_parole_hearings` tables

### Issue: Some inmates not found

**Cause:** Inmate not in CDCR database or CDCR number incorrect

**Solution:**
1. Manually verify CDCR number on https://ciris.mt.cdcr.ca.gov/
2. Check transcript text for correct CDCR number format
3. Look for scraper output: "No records found"

## Performance Considerations

### Scraping Speed

- **Single inmate:** ~10-15 seconds
- **100 inmates:** ~25-40 minutes (with 2-second delays)
- Use `--visible` for debugging, headless for production

### Database Performance

Indexes are created automatically:
- `idx_inmates_cdcr_number` - Fast inmate lookups
- `idx_transcripts_cdcr_number` - Fast transcript joins
- `idx_parole_hearings_cdcr` - Fast hearing lookups

### Rate Limiting

The scraper includes 2-second delays between requests to respect the CDCR website. **Do not reduce these delays.**

## Next Steps

### Immediate

1. ✅ Run database migration
2. ✅ Install Python dependencies
3. ✅ Test with single CDCR number
4. ✅ Run full scrape for all transcripts
5. ✅ Integrate `InmateInfo` component into UI

### Future Enhancements

1. **Automatic scraping on upload** - Trigger scraper when new transcripts are uploaded
2. **Background jobs** - Use a job queue (e.g., BullMQ) for async scraping
3. **Real-time updates** - Subscribe to new transcripts and auto-fetch inmate data
4. **Admin UI** - Add "Scrape Inmate Data" button in the dashboard
5. **BrowserBase integration** - Use BrowserBase API for serverless scraping
6. **Incremental updates** - Only refresh data older than X days
7. **Error retry** - Automatically retry failed scrapes

## Additional Resources

- **CDCR Website:** https://ciris.mt.cdcr.ca.gov/
- **Playwright Docs:** https://playwright.dev/python/
- **Supabase Docs:** https://supabase.com/docs
- **Script README:** `scripts/README.md`

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Run scraper with `--visible` flag to debug
3. Check Supabase logs for database errors
4. Review the script output for error messages

---

**Created:** 2025-11-08
**Last Updated:** 2025-11-08

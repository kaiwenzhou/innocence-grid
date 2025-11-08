# CDCR Scraper Quick Start

## Prerequisites

```bash
cd scripts
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
playwright install chromium
```

## Common Commands

### Test Single CDCR Number (Visible)
```bash
python cdcr_scraper.py --cdcr D54803 --visible
```

### Scrape All Transcripts (First Time)
```bash
python cdcr_scraper.py
```

### Force Refresh All Data
```bash
python cdcr_scraper.py --force
```

### Debug Mode (Visible Browser)
```bash
python cdcr_scraper.py --visible
```

## Useful SQL Queries

### Check Data Coverage
```sql
SELECT
  COUNT(*) as total_transcripts,
  COUNT(DISTINCT cdcr_number) as unique_cdcr_numbers,
  COUNT(DISTINCT i.cdcr_number) as scraped_inmates
FROM transcripts t
LEFT JOIN inmates i ON t.cdcr_number = i.cdcr_number
WHERE t.cdcr_number IS NOT NULL;
```

### View Transcripts with Inmate Data
```sql
SELECT * FROM transcripts_with_inmates
WHERE cdcr_number IS NOT NULL
LIMIT 10;
```

### Find Transcripts Missing Inmate Data
```sql
SELECT t.id, t.file_name, t.cdcr_number
FROM transcripts t
LEFT JOIN inmates i ON t.cdcr_number = i.cdcr_number
WHERE t.cdcr_number IS NOT NULL
AND i.cdcr_number IS NULL;
```

### View Parole Hearing History
```sql
SELECT
  i.name,
  i.cdcr_number,
  h.hearing_date,
  h.action,
  h.outcome
FROM inmates i
JOIN board_of_parole_hearings h ON i.cdcr_number = h.cdcr_number
ORDER BY h.hearing_date DESC;
```

## TypeScript Usage

### Fetch Inmate Data
```typescript
import { InmateService } from '@/services/inmates';

// Get inmate
const inmate = await InmateService.getInmateByCDCR('D54803');

// Get hearings
const hearings = await InmateService.getParoleHearings('D54803');

// Get transcript with inmate
const data = await InmateService.getTranscriptWithInmate(transcriptId);

// Check coverage
const coverage = await InmateService.getInmateDataCoverage();
```

### Use in Component
```typescript
import { InmateInfo } from '@/components/InmateInfo';

<InmateInfo cdcrNumber={transcript.cdcr_number} />
```

## Troubleshooting

### No CDCR Numbers Found
```sql
SELECT cdcr_number FROM transcripts WHERE cdcr_number IS NOT NULL;
```

### Check Scraper Logs
```bash
python cdcr_scraper.py --visible --cdcr D54803
```

### Verify Database Connection
```bash
python -c "from dotenv import load_dotenv; import os; load_dotenv(); print(os.getenv('VITE_SUPABASE_URL'))"
```

## File Structure

```
innocence-grid/
├── migrations/
│   └── create_inmates_table.sql          # Database schema
├── scripts/
│   ├── cdcr_scraper.py                   # Main scraper
│   ├── requirements.txt                  # Python deps
│   └── README.md                         # Detailed docs
├── src/
│   ├── components/
│   │   └── InmateInfo.tsx                # UI component
│   ├── lib/
│   │   └── types.ts                      # TypeScript types
│   └── services/
│       ├── inmates.ts                    # Inmate service
│       └── transcripts.ts                # Transcript service
└── CDCR_SCRAPER_SETUP.md                 # Full setup guide
```

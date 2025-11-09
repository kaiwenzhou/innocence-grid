# Commissioner Database Setup Guide

## Overview

This system tracks California Board of Parole Hearings commissioners' backgrounds, statistics, and patterns. The database integrates with the JusticeMAP platform to help identify potential biases and patterns in parole hearings.

## 🎯 Features

- **Commissioner Profiles**: Store detailed background information, education, and career history
- **Hearing Statistics**: Track grant rates, denial rates, and hearing outcomes
- **Bias Detection**: Identify commissioners with patterns in high-bias cases
- **Auto-Linking**: Automatically link commissioners to transcripts by name detection
- **Living Database**: Regular updates from official sources

## 📋 Setup Instructions

### Step 1: Create Database Tables

Run the SQL setup file in your Supabase SQL Editor:

```sql
-- Execute this file in Supabase
-- File: database-commissioners-setup.sql
```

This creates:
- `commissioners` table - Commissioner profiles and background
- `commissioner_hearings` table - Links commissioners to transcripts
- `commissioner_statistics` table - Aggregated hearing statistics

### Step 2: Initial Data Population

The database comes pre-loaded with all 21 current California BPH commissioners:

- Robert Barton
- Patricia Cassady
- Kevin Chappell
- Dianne Dobbs
- Julie Garland
- Gilbert Infante
- Teal Kozel
- David Long
- Michele Minor
- William Muniz
- David Ndudim
- Kathleen O'Meara
- Catherine Purcell
- Michael Ruff
- Rosalind Sargent-Burns
- Neil Schneider
- Excel Sharrieff
- Emily Sheffield
- Troy Taira
- Mary Thornton
- Jack Weiss

### Step 3: Add Detailed Commissioner Information

Use the UI or API to add detailed background information:

**Option A: Using the UI**
1. Navigate to `/commissioners` in your app
2. Click "Update Data" to sync the initial commissioner list
3. Click on any commissioner card to view/edit details
4. Add biography, education, previous roles manually

**Option B: Using the API**

```typescript
import { CommissionerScraperService } from "@/services/commissionerScraper";

// Add detailed commissioner information
await CommissionerScraperService.addCommissionerManually({
  full_name: "Robert Barton",
  biography: "Commissioner Barton has over 20 years of experience in criminal justice...",
  previous_roles: [
    {
      title: "Deputy District Attorney",
      organization: "Los Angeles County District Attorney's Office",
      description: "Prosecuted felony cases including homicides and gang-related crimes"
    }
  ],
  education: [
    {
      degree: "J.D.",
      institution: "USC Gould School of Law",
      year: "2000"
    },
    {
      degree: "B.A. Political Science",
      institution: "UCLA",
      year: "1997"
    }
  ],
  specializations: ["Criminal Law", "Gang Violence", "Victim Advocacy"]
});
```

### Step 4: Auto-Link Commissioners to Transcripts

When processing transcripts, automatically detect and link commissioners:

```typescript
import { CommissionerScraperService } from "@/services/commissionerScraper";

// After uploading a transcript
const transcriptId = "...";
const transcriptText = "...";

// Auto-detect and link commissioners mentioned in the transcript
const linkedIds = await CommissionerScraperService.linkCommissionersFromTranscript(
  transcriptId,
  transcriptText
);

console.log(`Linked ${linkedIds.length} commissioners to this hearing`);
```

## 🔄 Data Sources

### Primary Source
**California Board of Parole Hearings**
- URL: https://www.cdcr.ca.gov/bph/commissioners/
- Contains: Commissioner names, photos, and basic information
- Individual commissioner bio pages (where available)

### Manual Data Entry
Due to CORS restrictions and website structure, detailed commissioner information should be manually researched and entered from:

1. **Official BPH Website**: Individual commissioner pages
2. **California Government Records**: Appointment records
3. **Public Records**: Court cases, legal filings
4. **News Articles**: Background information and career history
5. **LinkedIn/Professional Profiles**: Education and experience

## 📊 Using Commissioner Data

### View Commissioner Statistics

```typescript
import { CommissionerService } from "@/services/commissioners";

// Get all commissioners with statistics
const commissioners = await CommissionerService.getCommissionersWithStats();

// Find high grant-rate commissioners
const highGrantRate = commissioners.filter(c => 
  c.statistics && c.statistics.grant_rate > 50
);

// Find commissioners with bias patterns
const highBiasCases = commissioners.filter(c => 
  c.statistics && c.statistics.high_bias_cases > 5
);
```

### Link Commissioner to a Hearing

```typescript
import { CommissionerService } from "@/services/commissioners";

await CommissionerService.linkCommissionerToHearing(
  commissionerId,
  transcriptId,
  {
    hearing_date: "2024-01-15",
    hearing_type: "parole_suitability",
    hearing_outcome: "denial",
    decision_rationale: "..."
  }
);
```

### Find Commissioners in Transcript

```typescript
import { CommissionerService } from "@/services/commissioners";

const transcriptText = "COMMISSIONER BARTON: Thank you for appearing today...";
const foundCommissioners = await CommissionerService.findCommissionersInText(transcriptText);
// Returns: [Commissioner { full_name: "Robert Barton", ... }]
```

## 🔍 Research Tips for Manual Data Entry

### Where to Find Commissioner Information

1. **BPH Website**: Start with official pages
   - https://www.cdcr.ca.gov/bph/commissioners/

2. **California Senate Confirmations**
   - Search Senate Judiciary Committee records
   - Governor appointment announcements

3. **Legal Databases**
   - State Bar of California
   - Court records (if previously an attorney or judge)

4. **News Archives**
   - Search commissioner name + "appointed"
   - Look for press releases and articles

5. **Professional Backgrounds**
   - Law enforcement agencies
   - District Attorney offices
   - Victim advocacy organizations

### Information to Collect

For each commissioner, try to find:
- ✅ Full name and title
- ✅ Current status (active/inactive)
- ✅ Appointment date and appointing governor
- ✅ Educational background (degrees, institutions)
- ✅ Previous career positions
- ✅ Areas of specialization or expertise
- ✅ Notable cases or achievements
- ✅ Professional associations

## 🔄 Keeping Data Current

### Automatic Refresh

Set up periodic updates to check for new commissioners:

```typescript
// Check for commissioners needing refresh (not updated in 30+ days)
const needsRefresh = await CommissionerService.getCommissionersNeedingRefresh();

for (const commissioner of needsRefresh) {
  // Manually research and update
  await CommissionerService.updateCommissioner(commissioner.id, {
    // ... updated information
    last_scraped_at: new Date().toISOString()
  });
}
```

### Monitor Official Website

Check the BPH website periodically for:
- New commissioner appointments
- Commissioner retirements
- Updated biographies
- New photos or information

## 📈 Analytics and Insights

### Commissioner Grant Rate Comparison

```sql
SELECT 
    c.full_name,
    s.grant_rate,
    s.total_hearings
FROM commissioners c
LEFT JOIN commissioner_statistics s ON c.id = s.commissioner_id
WHERE s.total_hearings > 10
ORDER BY s.grant_rate DESC;
```

### Identify Bias Patterns

```sql
SELECT 
    c.full_name,
    s.high_bias_cases,
    s.total_hearings,
    ROUND((s.high_bias_cases::decimal / s.total_hearings) * 100, 2) as bias_percentage
FROM commissioners c
LEFT JOIN commissioner_statistics s ON c.id = s.commissioner_id
WHERE s.high_bias_cases > 0
ORDER BY bias_percentage DESC;
```

### Commissioner Hearing History

```sql
SELECT 
    c.full_name,
    COUNT(ch.id) as total_hearings,
    COUNT(CASE WHEN ch.hearing_outcome = 'grant' THEN 1 END) as grants,
    COUNT(CASE WHEN ch.hearing_outcome = 'denial' THEN 1 END) as denials
FROM commissioners c
LEFT JOIN commissioner_hearings ch ON c.id = ch.commissioner_id
GROUP BY c.id, c.full_name
ORDER BY total_hearings DESC;
```

## 🛠️ Troubleshooting

### Issue: Commissioners not linking to transcripts

**Solution**: Check name variations in transcript text
- Add variations: "COMMISSIONER SMITH" vs "Commissioner Smith" vs "Smith"
- Update the `findCommissionersInText` function with more patterns

### Issue: Statistics not updating

**Solution**: Manually recalculate statistics
```typescript
await CommissionerService.calculateStatistics(commissionerId);
```

### Issue: Duplicate commissioners

**Solution**: Use the unique constraint on `full_name`
```sql
-- Check for duplicates
SELECT full_name, COUNT(*) 
FROM commissioners 
GROUP BY full_name 
HAVING COUNT(*) > 1;
```

## 📝 Next Steps

1. ✅ Run database setup SQL
2. ✅ Verify initial commissioner list loaded
3. 🔄 Research and add detailed bios (ongoing)
4. 🔄 Link commissioners to existing transcripts
5. 🔄 Set up periodic data refresh schedule
6. 📊 Build analytics dashboards using commissioner data

## 🤝 Contributing Data

If you're a collaborator helping to research commissioner backgrounds:

1. Use the template in `commissionerScraper.ts`
2. Add detailed information systematically
3. Include sources/citations in the biography field
4. Mark `last_scraped_at` when updating
5. Validate grant rates against official records

## 📚 Resources

- **Official BPH Website**: https://www.cdcr.ca.gov/bph/
- **Commissioner Page**: https://www.cdcr.ca.gov/bph/commissioners/
- **California State Bar**: https://www.calbar.ca.gov/
- **Governor's Appointments**: https://www.gov.ca.gov/appointments/

---

For questions or issues, refer to the main project documentation or contact the development team.


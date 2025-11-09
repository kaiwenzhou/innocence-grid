# ✅ Add Commissioner Brenna Kantrovitz with LinkedIn

## What's Been Done

1. ✅ Created SQL script to add Brenna Kantrovitz to the database
2. ✅ Updated CommissionerProfile page to show LinkedIn icon for LinkedIn profiles
3. ✅ Button automatically detects LinkedIn URLs and displays appropriate icon/text

## Step 1: Run the SQL in Supabase

1. Go to **Supabase Dashboard** → Your Project → **SQL Editor**
2. Click **"New Query"**
3. Copy and paste this SQL:

```sql
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
```

4. Click **"Run"** (or press Cmd+Enter / Ctrl+Enter)

## Step 2: Verify in the App

After running the SQL:

1. Refresh your JusticeMAP app
2. Navigate to **Commissioner Breakdown** page
3. Search for "BRENNA KANTROVITZ"
4. Click on her profile
5. You should see:
   - ✅ Commissioner name: BRENNA KANTROVITZ
   - ✅ Badge: "Unknown Background"
   - ✅ Background details displayed
   - ✅ **"View LinkedIn Profile"** button in the Resources section (with LinkedIn icon)
6. Click the LinkedIn button - it should open her LinkedIn profile in a new tab

## What the UI Will Look Like

### Resources Card:
```
Resources
┌──────────────────────────────────┐
│ [LinkedIn Icon] View LinkedIn Profile │ ← Clickable button
├──────────────────────────────────┤
│ [Scale Icon] View All Commissioners   │
└──────────────────────────────────┘
```

### Profile Header:
```
BRENNA KANTROVITZ
[Unknown Background] [Active]
```

## Features Implemented

### 1. Smart Button Detection
The profile page now automatically detects if the profile_url is:
- **LinkedIn**: Shows LinkedIn icon + "View LinkedIn Profile"
- **CDCR/Other**: Shows Building icon + "View CDCR Profile"

### 2. Database Entry
- Full name: BRENNA KANTROVITZ
- LinkedIn: https://www.linkedin.com/in/brenna-hall-kantrovitz-6a098ab3/
- Status: Active
- Background: Pending research (can be updated later)

### 3. Clickable Link
- Opens in new tab
- Proper external link handling
- LinkedIn icon for visual clarity

## Future Updates

To add more information about Brenna Kantrovitz later:

```sql
UPDATE commissioners
SET 
    background_category = 'Your Category Here',
    background_details = 'Detailed background information here',
    biography = 'Full biography text here',
    previous_roles = '[{"title": "Role Title", "organization": "Organization Name"}]'::jsonb,
    education = '[{"degree": "Degree Name", "institution": "School Name"}]'::jsonb
WHERE full_name = 'BRENNA KANTROVITZ';
```

## Troubleshooting

### Profile doesn't show up
- Make sure you ran the SQL in Supabase
- Check that the SQL executed successfully (no errors)
- Refresh the app page
- Clear browser cache if needed

### LinkedIn button doesn't appear
- Verify the `profile_url` field contains the LinkedIn URL
- Check the SQL query result to confirm the data was inserted
- Refresh the commissioner profile page

### Button says "CDCR Profile" instead of "LinkedIn Profile"
- The URL must contain "linkedin.com" for automatic detection
- Verify the URL in the database matches: `https://www.linkedin.com/in/brenna-hall-kantrovitz-6a098ab3/`

## Files Modified

1. **`add-brenna-kantrovitz.sql`** - SQL script to add commissioner
2. **`src/pages/CommissionerProfile.tsx`** - Added LinkedIn icon support
3. **`ADD_BRENNA_KANTROVITZ_INSTRUCTIONS.md`** - This guide

---

**The SQL file is ready to run:** `add-brenna-kantrovitz.sql`

Run it now and Brenna Kantrovitz will appear with her LinkedIn profile linked! 🎉


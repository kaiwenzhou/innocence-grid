# 🚨 URGENT FIX - Cases Not Moving Between Columns

## The Problem
Your database is missing the `status` column, so cases can't move between columns when you click "Generate Form".

## The Solution (2 Minutes to Fix!)

### Step 1: Open Supabase SQL Editor
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New Query"**

### Step 2: Run This SQL
Copy and paste this entire SQL code:

```sql
-- Add status column if it doesn't exist
ALTER TABLE transcripts 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'unassigned'
CHECK (status IN ('unassigned', 'assigned', 'in_review', 'completed', 'flagged'));

-- Add assigned_to column if it doesn't exist
ALTER TABLE transcripts 
ADD COLUMN IF NOT EXISTS assigned_to TEXT;

-- Add assigned_at column if it doesn't exist
ALTER TABLE transcripts 
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP;

-- Add form_data column to store generated form data
ALTER TABLE transcripts 
ADD COLUMN IF NOT EXISTS form_data JSONB;

-- Update existing records that are processed to have status 'completed'
UPDATE transcripts 
SET status = 'completed' 
WHERE processed = true AND status = 'unassigned';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_transcripts_status ON transcripts(status);
```

### Step 3: Click "Run" (or press Cmd+Enter / Ctrl+Enter)

### Step 4: Refresh Your Dashboard
1. Go back to your JusticeMAP app (localhost:3000)
2. Refresh the page (F5 or Cmd+R)
3. Click "Generate Form" again
4. **THE CASE WILL NOW MOVE! ✅**

## What This Fix Does

✅ Adds `status` column to track case progress  
✅ Adds `assigned_to` column for volunteer assignments  
✅ Adds `assigned_at` column for tracking  
✅ Adds `form_data` column to store generated forms  
✅ Updates existing processed cases to "completed" status  
✅ Creates index for faster queries  

## After Running the SQL

The flow will work perfectly:

**Under Review** → [Click Generate Form] → **Forms Generated**

Cases will automatically move between columns!

## Verification

After running the SQL, you should see:
- Success message in Supabase SQL Editor
- All 4 new columns added to transcripts table
- Dashboard working correctly

## Still Not Working?

If it still doesn't work after running the SQL:
1. Check the SQL ran without errors in Supabase
2. Refresh your browser (hard refresh: Cmd+Shift+R or Ctrl+Shift+R)
3. Open browser console (F12) and check for errors
4. Make sure you're using the correct Supabase project

---

**The SQL file is saved as:** `FIX_MISSING_STATUS_COLUMN.sql`

Run it now and your cases will move! 🚀


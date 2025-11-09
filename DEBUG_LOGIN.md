# 🔍 DEBUG LOGIN - Step by Step

## ✅ Your SQL File is Correct!

The `database-volunteers-setup.sql` file looks good. Let's debug the actual issue.

---

## Step 1: Check If You Ran the SQL

### In Supabase SQL Editor:

1. Go to: https://supabase.com/dashboard/project/qymvmcxnwdkegdctxibi/sql

2. Run this query to check if the volunteers table exists:
```sql
SELECT * FROM volunteers;
```

**Expected Result:**
- ✅ If you see 5 volunteers → SQL was run successfully!
- ❌ If you see "relation 'volunteers' does not exist" → SQL was NOT run yet

---

## Step 2: If Table Doesn't Exist - Run the SQL

1. **Open**: `database-volunteers-setup.sql` in your project
2. **Select ALL** (Cmd+A or Ctrl+A)
3. **Copy** (Cmd+C or Ctrl+C)
4. **Paste** into Supabase SQL Editor
5. **Click RUN** (green button, bottom right)

**You should see:** ✅ "Success. No rows returned"

---

## Step 3: Verify Volunteers Were Created

Run this again:
```sql
SELECT * FROM volunteers;
```

**You should see 5 rows:**
| id | email | full_name | role |
|----|-------|-----------|------|
| uuid | jordan.rivers@justicemap.org | Jordan Rivers | volunteer |
| uuid | alex.chen@justicemap.org | Alex Chen | volunteer |
| ... | ... | ... | ... |

---

## Step 4: Check Supabase Connection

### Verify your `.env` file:

```bash
# Open .env file and check:
VITE_SUPABASE_URL=https://qymvmcxnwdkegdctxibi.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Make sure:**
- ✅ URL matches your Supabase project
- ✅ Anon key is correct
- ✅ No extra spaces or quotes

---

## Step 5: Restart Dev Server

Sometimes environment variables need a restart:

1. **Stop the server**: Press Ctrl+C in terminal
2. **Start again**: `npm run dev`
3. **Try login again**: http://localhost:8080/login

---

## Step 6: Check Browser Console for Errors

1. **Open your browser** at: http://localhost:8080/login
2. **Press F12** (or right-click → Inspect)
3. **Go to "Console" tab**
4. **Click a volunteer button** (Jordan R.)
5. **Look for RED error messages**

### Common Errors & Solutions:

**Error: "relation 'volunteers' does not exist"**
- Solution: Run the SQL migration in Supabase

**Error: "Invalid API key"**
- Solution: Check your `.env` file has correct Supabase credentials

**Error: "Failed to fetch"**
- Solution: Check internet connection or Supabase URL

**Error: "Could not login"**
- Solution: Check console for more details

---

## Step 7: Manual Test of VolunteerService

Open browser console on login page and run:

```javascript
// Test if Supabase is connected
const { data, error } = await window.supabase
  .from('volunteers')
  .select('*')
  .limit(1);

console.log('Data:', data);
console.log('Error:', error);
```

**If this works, volunteers exist!**

---

## Step 8: Check Network Tab

1. **Press F12** → **"Network" tab**
2. **Click a volunteer button**
3. **Look for requests** to Supabase
4. **Find the "volunteers" request**
5. **Check**:
   - Status: Should be 200 (OK)
   - Response: Should show volunteer data

**If Status is 404:** Table doesn't exist
**If Status is 401:** API key issue
**If Status is 500:** Database error

---

## Quick Test Commands

### Run these in Supabase SQL Editor:

```sql
-- Test 1: Does volunteers table exist?
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'volunteers';

-- Test 2: How many volunteers?
SELECT COUNT(*) FROM volunteers;

-- Test 3: Get one volunteer
SELECT * FROM volunteers LIMIT 1;

-- Test 4: Check transcripts table has new columns
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'transcripts' AND column_name IN ('assigned_to', 'status');
```

---

## 🎯 Most Likely Issues (in order):

1. **SQL not run yet** (90% of cases)
   - Solution: Run the SQL migration

2. **Dev server needs restart** (5%)
   - Solution: Ctrl+C then `npm run dev`

3. **Wrong Supabase credentials** (3%)
   - Solution: Check `.env` file

4. **Browser cache** (2%)
   - Solution: Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)

---

## 🚀 After You Fix It

You should see:
1. Click "Jordan R." button
2. Toast notification: "Welcome, Jordan Rivers!"
3. Redirect to `/clients` page
4. See "Jordan Rivers" in sidebar
5. See all 290 transcripts
6. Assignment dropdowns work!

---

## Still Stuck?

**Share with me:**
1. Screenshot of Supabase SQL Editor showing `SELECT * FROM volunteers;`
2. Screenshot of browser console (F12) when you click login
3. Contents of your `.env` file (URL and first 20 characters of key only)

I'll help you fix it! 🛠️


# Hack for Social Good - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Supabase Project
1. Go to https://supabase.com and sign up/login
2. Click "New Project"
3. Fill in project details:
   - Name: `hack-for-social-good`
   - Database Password: (create a strong password)
   - Region: (choose closest to you)
4. Wait 2-3 minutes for project to initialize

### Step 2: Set Up Database
1. In Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click **New Query**
3. Open the `database-setup.sql` file from this project
4. Copy the SQL code (use **Option 1: Simple Schema** to start)
5. Paste into Supabase SQL Editor
6. Click **Run** or press `Ctrl/Cmd + Enter`
7. You should see "Success. No rows returned"

### Step 3: Get Your API Credentials
1. In Supabase dashboard, go to **Project Settings** (gear icon)
2. Click **API** in the left menu
3. You'll see:
   - **Project URL** (e.g., `https://abcdefg.supabase.co`)
   - **Project API keys** → Copy the `anon` `public` key

### Step 4: Configure Environment Variables
1. Open the `.env` file in this project
2. Replace the placeholder values:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### Step 5: Install Dependencies & Run
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app should now be running at **http://localhost:5173** 🎉

## 📊 Using the Application

### Upload a Transcript
1. Navigate to the **Upload** page
2. Drag and drop a `.txt` file or click to browse
3. **Filename format** (optional, for auto-metadata extraction):
   ```
   YYYY-MM-DD_InmateName_CDCRXXXXXX.txt
   Example: 2024-01-15_JohnDoe_CDCR123456.txt
   ```

### View Transcripts
1. Go to the **Transcripts** page
2. See all uploaded transcripts in a sortable table
3. Click on any transcript for details

### Dashboard
- View statistics: total transcripts, processed, pending

## 🔧 Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env` file exists in project root
- Verify both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
- Restart the dev server: Stop (`Ctrl+C`) and run `npm run dev` again

### No transcripts appearing
- Check browser console (F12) for errors
- Verify database tables were created: Go to Supabase → Table Editor
- Try uploading a test file

### Database connection errors
- Verify your Supabase project is active (check supabase.com)
- Double-check API credentials in `.env`
- Make sure you copied the correct values without extra spaces

## 📁 Database Schema

### Current (Simple Schema)

**transcripts table:**
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT | UUID primary key |
| file_name | TEXT | Name of uploaded file |
| raw_text | TEXT | Full transcript content |
| hearing_date | DATE | Date of hearing (optional) |
| inmate_name | TEXT | Inmate name (optional) |
| cdcr_number | TEXT | CDCR number (optional) |
| processed | BOOLEAN | Analysis status |
| uploaded_at | TIMESTAMP | Upload timestamp |

**predictions table:**
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Auto-increment primary key |
| transcript_id | TEXT | Foreign key to transcripts |
| innocence_score | REAL | 0-1 innocence score |
| explicit_claims | JSONB | Array of claims |
| implicit_signals | JSONB | Array of signals |
| model_version | TEXT | AI model version |
| analyzed_at | TIMESTAMP | Analysis timestamp |

## 🔐 Upgrading to Authentication (Optional)

If you want to add user authentication later:
1. Use **Option 2** in `database-setup.sql`
2. Follow the detailed guide in `SUPABASE_MIGRATION.md`
3. This adds Row Level Security (RLS) so users only see their own data

## 📚 Additional Resources

- Full setup guide: `SETUP.md`
- Migration guide: `SUPABASE_MIGRATION.md`
- Supabase docs: https://supabase.com/docs
- Project info: `README.md`

## 🎯 Next Steps

After basic setup works:
- [ ] Implement AI-powered analysis for innocence scoring
- [ ] Add batch upload capability
- [ ] Implement full-text search
- [ ] Add export functionality (PDF reports)
- [ ] Deploy to production (see README.md)

---

**Need help?** Check the documentation files or open an issue on GitHub.


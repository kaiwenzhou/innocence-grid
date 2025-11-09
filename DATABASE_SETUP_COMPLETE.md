# ✅ Database Setup Guide - Hack for Social Good

## 🎯 What This Project Does

**Hack for Social Good** is a Wrongful Conviction Analyzer that:
- Allows users to upload court transcripts (text files)
- Analyzes transcripts for innocence indicators
- Calculates innocence scores
- Identifies explicit claims and implicit signals
- Provides a dashboard to view and manage all transcripts

## 📦 What's Been Set Up

I've successfully cloned the repository and created these setup files for you:

1. ✅ **database-setup.sql** - Complete SQL schema for Supabase
2. ✅ **QUICKSTART.md** - 5-minute setup guide
3. ✅ **ENV_TEMPLATE.txt** - Environment variables template

## 🚀 Quick Start (Follow These Steps)

### 1️⃣ Create Supabase Account & Project

```bash
1. Visit https://supabase.com
2. Sign up or login
3. Click "New Project"
4. Name: hack-for-social-good
5. Choose a database password
6. Select your region
7. Wait 2-3 minutes for setup
```

### 2️⃣ Load the Database Schema

```bash
1. In Supabase Dashboard → SQL Editor
2. Click "New Query"
3. Open database-setup.sql from this project
4. Copy the SQL (use Option 1: Simple Schema)
5. Paste in SQL Editor
6. Click RUN
```

**Expected result:** "Success. No rows returned"

### 3️⃣ Get Your API Credentials

```bash
1. Supabase Dashboard → Project Settings (gear icon)
2. Click API
3. Copy two values:
   - Project URL
   - anon public key
```

### 4️⃣ Create Environment File

Create a file named `.env` in the project root:

```bash
# On Mac/Linux terminal:
cat > .env << 'EOF'
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
EOF
```

Or manually create `.env` file with your values (see `ENV_TEMPLATE.txt`)

### 5️⃣ Install & Run

```bash
npm install
npm run dev
```

Visit: **http://localhost:5173** 🎉

## 📊 Database Schema Overview

### Option 1: Simple Schema (Recommended)

**transcripts** table:
- Stores uploaded transcript files
- Extracts metadata (dates, names, CDCR numbers)
- Tracks processing status

**predictions** table:
- Stores AI analysis results
- Innocence scores (0-1)
- Explicit claims and implicit signals
- Links to transcripts

### Option 2: Advanced Schema (With Auth)

Includes everything above PLUS:
- User authentication (Supabase Auth)
- Row Level Security (RLS)
- Users can only see their own data
- Storage buckets for PDF files

**To use Option 2:** See `SUPABASE_MIGRATION.md`

## 📝 How to Use the Application

### Upload a Transcript

1. Go to Upload page
2. Drag & drop a `.txt` file
3. Optional filename format for auto-extraction:
   ```
   2024-01-15_JohnDoe_CDCR123456.txt
   ↓
   hearing_date: 2024-01-15
   inmate_name: John Doe
   cdcr_number: CDCR123456
   ```

### View Transcripts

- Navigate to Transcripts page
- Browse, sort, and filter transcripts
- Click any row for detailed view

### Dashboard

- Total transcripts count
- Processed vs pending
- Statistics overview

## 🗂️ Project Structure

```
HackforSocialGood/
├── database-setup.sql       ← SQL schema (run this in Supabase)
├── QUICKSTART.md            ← 5-minute setup guide
├── ENV_TEMPLATE.txt         ← Environment variables template
├── SETUP.md                 ← Detailed setup instructions
├── SUPABASE_MIGRATION.md    ← Advanced auth setup
├── src/
│   ├── lib/
│   │   ├── types.ts         ← Database types
│   │   ├── supabase.ts      ← Supabase client
│   │   └── mockData.ts      ← Sample data
│   ├── services/
│   │   └── transcripts.ts   ← API service layer
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Upload.tsx
│   │   └── Transcripts.tsx
│   └── components/
│       └── ui/              ← shadcn UI components
└── package.json
```

## 🔧 Troubleshooting

### Problem: "Missing Supabase environment variables"

**Solution:**
1. Verify `.env` file exists in project root
2. Check both variables are set (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY)
3. Restart dev server: `Ctrl+C` then `npm run dev`

### Problem: No transcripts showing

**Solution:**
1. Check browser console (F12) for errors
2. Verify tables exist: Supabase → Table Editor
3. Check data: Supabase → Table Editor → transcripts
4. Upload a test file

### Problem: Database connection error

**Solution:**
1. Verify Supabase project is active
2. Check API credentials in `.env`
3. Ensure no extra spaces in `.env` values
4. Try regenerating API keys in Supabase

### Problem: Upload fails

**Solution:**
1. Check file is `.txt` format
2. Verify file size is reasonable (<10MB)
3. Check browser console for specific error
4. Verify Supabase connection is working

## 📚 File Reference Guide

| File | Purpose |
|------|---------|
| `database-setup.sql` | Complete SQL schema - run in Supabase |
| `QUICKSTART.md` | Fast 5-minute setup guide |
| `SETUP.md` | Detailed setup instructions |
| `SUPABASE_MIGRATION.md` | Advanced auth setup guide |
| `ENV_TEMPLATE.txt` | Environment variables template |
| `README.md` | Project overview and deployment info |

## 🎯 Next Steps After Setup

### Immediate
- [ ] Test file upload functionality
- [ ] Verify database connection
- [ ] Upload a sample transcript
- [ ] Check dashboard displays correctly

### Short Term
- [ ] Add sample data for testing
- [ ] Customize UI branding
- [ ] Test all features

### Future Enhancements
- [ ] Implement AI analysis (OpenAI/Anthropic integration)
- [ ] Add batch upload
- [ ] Implement full-text search
- [ ] Add export to PDF functionality
- [ ] Deploy to production

## 🔐 Security Notes

**Current Setup (Simple Schema):**
- ⚠️ No user authentication
- ⚠️ All data is public within the app
- ✅ Good for testing/development
- ✅ Easy to set up

**Upgrade to Auth (Option 2):**
- ✅ User authentication required
- ✅ Row Level Security (RLS) enabled
- ✅ Users only see their own data
- ✅ Production-ready

## 🌐 Deployment

When ready to deploy:

1. **Via Lovable** (Easiest):
   - Go to https://lovable.dev/projects/02e063c1-f4cc-4613-ae90-7e48bf6294fc
   - Click Share → Publish

2. **Via Vercel/Netlify**:
   ```bash
   npm run build
   # Deploy dist/ folder
   ```

3. **Custom Domain**:
   - See README.md for instructions

## 📖 Additional Resources

- **Supabase Docs**: https://supabase.com/docs
- **React + Supabase Tutorial**: https://supabase.com/docs/guides/getting-started/tutorials/with-react
- **Shadcn UI**: https://ui.shadcn.com
- **Vite**: https://vitejs.dev

## ❓ Common Questions

**Q: Can I use PostgreSQL instead of Supabase?**
A: Yes, but you'll need to modify `src/lib/supabase.ts` to connect to your Postgres instance.

**Q: How do I add AI analysis?**
A: See `SUPABASE_MIGRATION.md` Step 4 for implementing AI analysis with Edge Functions.

**Q: Can I upload PDFs?**
A: Currently only .txt files. PDF support requires adding a PDF parser (see SUPABASE_MIGRATION.md).

**Q: How do I backup my database?**
A: Supabase provides automatic backups. Go to Project Settings → Database → Backups.

**Q: Is this production-ready?**
A: Simple schema (Option 1) is for development. Use Option 2 with authentication for production.

---

## ✅ Setup Checklist

- [ ] Created Supabase account
- [ ] Created new Supabase project
- [ ] Ran SQL schema from `database-setup.sql`
- [ ] Created `.env` file with credentials
- [ ] Ran `npm install`
- [ ] Ran `npm run dev`
- [ ] Application loads at localhost:5173
- [ ] Tested file upload
- [ ] Verified data appears in Supabase Table Editor

---

**🎉 You're all set! The database is ready to use.**

If you encounter any issues, refer to the troubleshooting section or check the other documentation files.


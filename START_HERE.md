# 🚀 START HERE - Hack for Social Good Database Setup

## ✅ What I've Done For You

I've successfully loaded the **Hack for Social Good** project (Innocence Grid) from GitHub and prepared everything you need:

### Files Created:
1. ✅ **database-setup.sql** - Ready-to-run SQL schema for Supabase
2. ✅ **DATABASE_SETUP_COMPLETE.md** - Complete reference guide
3. ✅ **QUICKSTART.md** - Fast 5-minute setup instructions
4. ✅ **ENV_TEMPLATE.txt** - Environment variables template

### Already in the Project:
- ✅ Full React + TypeScript application
- ✅ Supabase client configured (`@supabase/supabase-js` v2.80.0)
- ✅ Modern UI with shadcn components
- ✅ Service layer architecture ready for database
- ✅ Upload, Dashboard, and Transcripts pages built

## 🎯 What This Application Does

**Hack for Social Good** analyzes court transcripts for wrongful conviction indicators:
- Upload transcript files (.txt)
- Extract metadata (hearing dates, inmate names, CDCR numbers)
- Analyze for innocence indicators (AI-powered in future)
- Calculate innocence scores
- View all transcripts in a dashboard

## 🏁 Quick Start (3 Steps)

### Step 1: Create Supabase Project (2 minutes)
```
1. Go to https://supabase.com
2. Sign up/Login
3. Create new project: "hack-for-social-good"
4. Wait for initialization
```

### Step 2: Load Database (1 minute)
```
1. Supabase Dashboard → SQL Editor
2. Open: database-setup.sql
3. Copy Option 1 SQL code
4. Paste and Run in Supabase
```

### Step 3: Configure & Run (2 minutes)
```bash
# Create .env file with your Supabase credentials
cat > .env << 'EOF'
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
EOF

# Install and run
npm install
npm run dev
```

**App runs at:** http://localhost:5173

## 📋 Database Schema Options

### Option 1: Simple (Recommended to Start)
- ✅ No authentication needed
- ✅ Quick setup
- ✅ Perfect for testing
- 2 tables: `transcripts` + `predictions`

### Option 2: With Authentication
- 🔐 User authentication (Supabase Auth)
- 🔐 Row Level Security (users see only their data)
- 🔐 Production-ready
- See: `SUPABASE_MIGRATION.md`

## 📊 Database Tables

### transcripts
Stores uploaded court transcripts:
- `id` - Unique identifier
- `file_name` - Original filename
- `raw_text` - Full transcript content
- `hearing_date` - Date of hearing (extracted from filename)
- `inmate_name` - Inmate name (extracted)
- `cdcr_number` - CDCR number (extracted)
- `processed` - Analysis status
- `uploaded_at` - Upload timestamp

### predictions
Stores AI analysis results:
- `id` - Unique identifier
- `transcript_id` - Links to transcript
- `innocence_score` - Score from 0-1
- `explicit_claims` - JSON array of claims
- `implicit_signals` - JSON array of signals
- `model_version` - AI model version
- `analyzed_at` - Analysis timestamp

## 🎨 Application Features

### Current Features:
- ✅ File upload (drag & drop)
- ✅ Transcript listing with table view
- ✅ Dashboard with statistics
- ✅ Metadata extraction from filenames
- ✅ Sorting and filtering
- ✅ Responsive design

### Future Enhancements:
- 🔄 AI-powered innocence analysis
- 🔄 PDF file support
- 🔄 Full-text search
- 🔄 Batch upload
- 🔄 Export to PDF reports

## 🔧 Project Structure

```
HackforSocialGood/
├── 📄 START_HERE.md              ← You are here!
├── 📄 database-setup.sql          ← Run this in Supabase
├── 📄 DATABASE_SETUP_COMPLETE.md  ← Complete reference
├── 📄 QUICKSTART.md               ← Quick setup guide
├── 📄 ENV_TEMPLATE.txt            ← .env template
│
├── src/
│   ├── lib/
│   │   ├── supabase.ts            ← Supabase client (configured)
│   │   ├── types.ts               ← Database types
│   │   └── mockData.ts            ← Sample data
│   │
│   ├── services/
│   │   └── transcripts.ts         ← API service layer
│   │
│   ├── pages/
│   │   ├── Dashboard.tsx          ← Main dashboard
│   │   ├── Upload.tsx             ← File upload page
│   │   ├── Transcripts.tsx        ← List view
│   │   └── TranscriptDetail.tsx   ← Detail view
│   │
│   └── components/
│       └── ui/                    ← shadcn components
│
├── 📦 package.json                ← Dependencies
└── 🔧 vite.config.ts              ← Vite config
```

## 📚 Documentation Files

| File | Purpose | When to Use |
|------|---------|-------------|
| **START_HERE.md** | This file - quick overview | Read first |
| **QUICKSTART.md** | 5-minute setup guide | Setting up for the first time |
| **DATABASE_SETUP_COMPLETE.md** | Complete reference | Detailed info & troubleshooting |
| **database-setup.sql** | SQL schema | Run in Supabase SQL Editor |
| **ENV_TEMPLATE.txt** | Environment vars | Creating .env file |
| **SETUP.md** | Original setup guide | Alternative setup instructions |
| **SUPABASE_MIGRATION.md** | Auth setup guide | Adding authentication |
| **README.md** | Project overview | Deployment & project info |

## ⚡ Quick Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🔐 Getting Supabase Credentials

**Where to find them:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click ⚙️ **Project Settings**
4. Click **API** in left menu
5. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

**Create .env file:**
```env
VITE_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🐛 Common Issues & Fixes

### "Missing Supabase environment variables"
**Fix:** Create `.env` file in project root with your credentials

### No transcripts appearing
**Fix:** Check Supabase Table Editor to verify tables exist and have data

### Upload fails
**Fix:** Verify `.env` credentials are correct and Supabase project is active

### Port already in use
**Fix:** Kill process on port 5173 or Vite will use another port

## ✅ Setup Checklist

- [ ] Created Supabase account
- [ ] Created Supabase project
- [ ] Ran SQL from `database-setup.sql` in Supabase
- [ ] Created `.env` file with credentials
- [ ] Ran `npm install`
- [ ] Ran `npm run dev`
- [ ] App loads at http://localhost:5173
- [ ] Tested file upload
- [ ] Verified data in Supabase Table Editor

## 🎯 Next Steps

### Immediate (Get it running):
1. ✅ Follow the 3-step Quick Start above
2. ✅ Verify app loads in browser
3. ✅ Upload a test transcript file

### Short Term (Customize):
1. Add sample data for testing
2. Customize branding/colors
3. Test all features

### Long Term (Enhance):
1. Implement AI analysis (OpenAI/Anthropic)
2. Add user authentication (Option 2)
3. Deploy to production
4. Add advanced features (search, export, etc.)

## 📖 Tech Stack

- **Frontend:** React 18 + TypeScript
- **Build Tool:** Vite 5
- **UI Framework:** Tailwind CSS + shadcn/ui
- **Database:** Supabase (PostgreSQL)
- **State Management:** TanStack Query (React Query)
- **Routing:** React Router v6
- **Forms:** React Hook Form + Zod

## 🌐 Deployment Options

### Option 1: Lovable (Easiest)
Visit: https://lovable.dev/projects/02e063c1-f4cc-4613-ae90-7e48bf6294fc
Click: Share → Publish

### Option 2: Vercel/Netlify
```bash
npm run build
# Deploy dist/ folder
```

### Option 3: Custom Server
```bash
npm run build
# Serve dist/ folder with any static server
```

## 🆘 Need Help?

1. **Check documentation files** (see table above)
2. **Read troubleshooting** in `DATABASE_SETUP_COMPLETE.md`
3. **Check browser console** (F12) for errors
4. **Verify Supabase** Table Editor to see your data
5. **Check Supabase logs** in Dashboard

## 📞 Resources

- **Supabase Docs:** https://supabase.com/docs
- **React Docs:** https://react.dev
- **Shadcn UI:** https://ui.shadcn.com
- **Vite Docs:** https://vitejs.dev

---

## 🎉 Ready to Start!

**Everything is set up and ready to go!**

Follow the **Quick Start (3 Steps)** above and you'll have the app running in 5 minutes.

**Questions?** Check `DATABASE_SETUP_COMPLETE.md` for detailed information.

---

*Last updated: November 9, 2025*


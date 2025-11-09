# JusticeMAP - AI-Powered Wrongful Conviction Analysis Platform

A comprehensive platform combining **AI-powered innocence detection** with **multi-user case management** for analyzing parole hearing transcripts and identifying potential wrongful convictions.

## 🎯 Overview

JusticeMAP is a production-ready platform that helps volunteers identify and prioritize cases with strong innocence signals using advanced AI analysis and collaborative case management tools.

**Key Innovation:** Every client card displays an AI-generated summary of the most compelling innocence indicator from their transcript, powered by Google's Gemini AI.

---

## ✨ Key Features

### 🤖 AI-Powered Innocence Detection
- **Gemini 2.0 Flash Lite** integration for advanced natural language analysis
- **AI-generated innocence insights** on every client card - no more generic "available for review" text
- **Intelligent transcript chunking** preserving speaker context
- **4 signal types detected:**
  - Explicit claims ("I didn't do it")
  - Contextual signals (coerced confessions, evidence gaps)
  - Implicit signals (maintained innocence despite consequences)
  - Bias language (institutional patterns like "lack of insight")
- **Enhanced memo generation** with deep parsing (3-7 patterns per field)

### 👥 Multi-User Collaboration
- **Personalized Case Pipeline** - Each volunteer sees only their assigned cases
- **Volunteer authentication** with role-based access
- **Smart case assignment** workflow with "Assign to Me" buttons
- **Kanban board** tracking: Assigned to Me → Under Review → Forms Generated → Commissioner Panel Scheduled
- **Collaborative workspace** with team analytics

### 📊 Commissioner Analysis
- **Database of 23+ California BPH commissioners** with live updates
- **Dynamic background categorization:**
  - Law Enforcement & Corrections
  - Legal, Judicial & Prosecution
  - Legal, Judicial & Mixed Legal
  - Mental Health & Social Services
  - Parole Board Administration
- **Enhanced bias detection** with 15 bias language patterns (3x more comprehensive)
- **Commissioner profile pages** with LinkedIn/CDCR links
- **Panel composition analysis** for bias risk assessment
- **Real-time statistics** from database across 294 transcripts

### 📝 Automated Form Generation
- **Enhanced parsing accuracy** with multi-pattern matching (3-7 attempts per field)
- **Deep evidence extraction** identifying 5-10 specific pieces of evidence
- **Comprehensive conviction details** including enhancements and multiple counts
- **Multi-factor theory analysis** detecting 8 different wrongful conviction theories
- **Smart text normalization** fixing common transcript issues
- **20 wrongful conviction issue categories** with auto-checked boxes
- **One-click download** of formatted CONFIDENTIAL INTEROFFICE MEMORANDUM

### 🎯 Priority Recommendations
- **AI-driven case ranking** (0-100 score)
- **Multi-factor algorithm:**
  - Innocence claim strength (0-30 pts) - uses AI analysis
  - Commissioner bias risk (0-25 pts) - panel composition
  - Case urgency (0-25 pts) - hearing recency
  - Assignment status (0-20 pts) - unassigned = higher priority
- **Top 3 recommendations** in AI Priority Picks sidebar
- **Real-time updates** as cases are assigned

### 📄 PDF Storage & Viewing
- **Original PDF storage** in Supabase Storage
- **View Full Transcript** button opens original PDF in new tab
- **Line and page citations** for all AI-detected signals
- **Clean transcript formatting** with speaker labels and line numbers

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ ([install with nvm](https://github.com/nvm-sh/nvm))
- Supabase account (free tier works)
- Google Gemini API key ([get one here](https://aistudio.google.com/apikey))

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/kaiwenzhou/innocence-grid.git
   cd innocence-grid
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase database**
   - Create a new Supabase project
   - Open SQL Editor
   - Run `complete-commissioners-setup.sql` to create tables and populate commissioner data
   - Run `add-pdf-storage.sql` to add PDF storage columns
   - Run `FIX_MISSING_STATUS_COLUMN.sql` to ensure all required columns exist
   - Create Storage bucket `transcript-pdfs` with public access

4. **Configure environment variables**
   ```bash
   # Create .env file with:
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   VITE_GEMINI_API_KEY=your-gemini-api-key-here
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

   Visit **http://localhost:3000**

### First Steps

1. **Create volunteer account** on login page
2. **Navigate to Clients page** (first tab)
3. **Upload transcripts** (PDF or TXT format via Upload page)
4. **View AI-generated insights** on each client card
5. **Assign cases to yourself** using "Assign to Me" button
6. **Track your cases** in "My Case Pipeline"
7. **Generate forms** from "Under Review" column
8. **Analyze commissioner bias** in Commissioner Breakdown

---

## 📁 Project Structure

```
innocence-grid/
├── src/
│   ├── services/           # Backend logic
│   │   ├── gemini.ts                # Gemini API + AI insights
│   │   ├── innocenceDetector.ts     # Main analysis orchestrator
│   │   ├── priority.ts              # AI-powered priority scoring
│   │   ├── transcripts.ts           # Transcript CRUD + PDF storage
│   │   ├── commissioners.ts         # Commissioner database service
│   │   ├── volunteers.ts            # User management
│   │   ├── formProcessor.ts         # Enhanced form data extraction
│   │   └── memoGeneratorEnhanced.ts # Deep parsing memo generator
│   ├── utils/              # Utilities
│   │   ├── transcriptChunker.ts     # Intelligent chunking
│   │   ├── speakerParser.ts         # Speaker identification
│   │   └── transcriptPreprocessor.ts # Text cleanup
│   ├── pages/              # React pages
│   │   ├── Clients.tsx              # Main page with AI insights
│   │   ├── Dashboard.tsx            # My Case Pipeline (Kanban)
│   │   ├── TranscriptDetail.tsx     # Analysis UI with citations
│   │   ├── Cases.tsx                # Case analysis + commissioner panels
│   │   ├── CommissionerBreakdown.tsx # Enhanced bias analysis
│   │   ├── CommissionerProfile.tsx  # Individual commissioner pages
│   │   ├── Transcripts.tsx          # Transcript list
│   │   ├── Analyze.tsx              # Platform analytics
│   │   ├── Upload.tsx               # File upload
│   │   └── Login.tsx                # Authentication
│   ├── components/         # UI components
│   │   ├── AIRecommendationsSidebar.tsx # Priority picks
│   │   ├── layout/
│   │   │   ├── AppSidebar.tsx       # Main navigation
│   │   │   └── DashboardLayout.tsx  # Layout wrapper
│   │   └── ui/             # shadcn/ui components
│   └── lib/                # Types, config, utils
├── complete-commissioners-setup.sql  # Commissioner database setup
├── add-pdf-storage.sql              # PDF storage migration
├── FIX_MISSING_STATUS_COLUMN.sql    # Status column migration
└── README.md                         # This file
```

---

## 🛠 Tech Stack

**Frontend:**
- React 18 + TypeScript 5.8
- Vite 5.4 (build tool)
- Tailwind CSS 3.4 (styling)
- shadcn/ui (50+ components)
- React Router 6 (navigation with lazy loading)

**Backend:**
- Supabase (PostgreSQL database + auth + storage)
- Google Generative AI (Gemini 2.0 Flash Lite)
- TanStack React Query (data fetching)

**Additional:**
- PDF.js (PDF text extraction)
- Zod (validation)
- React Hook Form (form management)
- Lucide React (icons)

---

## 🎨 User Interface

### Navigation (5 tabs)
1. **Clients** - Browse all cases with AI insights
2. **My Case Pipeline** - Personal Kanban board
3. **Transcripts** - Upload and manage transcripts
4. **Analyse** - Platform-wide analytics
5. **Commissioner Breakdown** - Bias analysis by commissioner

### My Case Pipeline (Kanban Board)
- **Assigned to Me** - Cases you've been assigned (status: assigned)
- **Under Review** - Cases you're actively reviewing (status: in_review)
  - Includes "Generate Form" button for instant memo download
- **Forms Generated** - Cases with completed memos (status: completed)
- **Commissioner Panel Scheduled** - Cases ready for hearing (status: flagged)

### Client Cards
Each card shows:
- Client name and CDCR number
- Case strength badge (High/Medium/Low)
- Status badge (In Progress/Completed/Unassigned)
- **AI-generated innocence insight** (not generic text!)
- Hearing date with avatar
- Action buttons: View Case, Analyze
- Assignment dropdown showing "UNASSIGNED" or volunteer name

### AI Priority Picks Sidebar
- Top 3 AI-ranked cases
- Score breakdown: Innocence / Bias / Urgency / Status
- "Analyze" and "Assign to Me" buttons
- Methodology explanation dialog

---

## 🔍 How It Works

### AI-Generated Innocence Insights

Every client card now shows a **short, compelling sentence** extracted by AI:

```
1. Page loads with 294 client transcripts
      ↓
2. For first 20 visible cards:
   - Extract first 3000 characters of transcript
   - Send to Gemini 2.0 Flash Lite
   - AI identifies most compelling innocence indicator
      ↓
3. AI looks for:
   - Direct innocence claims
   - Alibi evidence with corroboration
   - Coerced confessions
   - Witness recantations
   - Misidentification issues
      ↓
4. Returns short sentence (max 15 words):
   - "Claims he was at work when crime occurred, has time cards"
   - "States confession was coerced after 18 hours"
   - "Maintains innocence despite refusing plea deal"
      ↓
5. Display on card (italic styling)
      ↓
6. Load remaining insights in batches of 5
```

**Fallback Strategy:**
- Level 1: AI-generated (best)
- Level 2: Pattern matching (good)
- Level 3: Generic text (fallback)

### Commissioner Breakdown Analysis

Now processes **all 294 transcripts** with:
- **Database-first approach** - pulls commissioner data from Supabase
- **Dual extraction strategies** - panel section + dialogue mentions
- **15 bias patterns** (was 5):
  - lack of insight, minimizing, denial, not taking responsibility, lack of remorse
  - not suitable, unrealistic, superficial, not credible, manipulative
  - danger to society, continues to pose risk, not rehabilitated, risk to public safety, unresolved issues
- **12 innocence patterns** (was 6):
  - didn't do, innocent, wrongly convicted, falsely accused, was not there
  - someone else did, misidentification, actually innocent, false testimony, etc.
- **Enhanced name validation** - filters out "Commissioner AND" and other false positives
- **Real-time statistics logging** to browser console

---

## 📚 Documentation

### Core Documentation
- **[AI_INNOCENCE_INSIGHTS.md](./AI_INNOCENCE_INSIGHTS.md)** - AI insights feature guide
- **[COMMISSIONER_BREAKDOWN_FIXED.md](./COMMISSIONER_BREAKDOWN_FIXED.md)** - Enhanced bias detection
- **[MEMO_GENERATOR_IMPLEMENTATION.md](./MEMO_GENERATOR_IMPLEMENTATION.md)** - Deep parsing memo generator
- **[PDF_STORAGE_SETUP_GUIDE.md](./PDF_STORAGE_SETUP_GUIDE.md)** - PDF storage configuration

### Recent Updates
- **[NAVIGATION_AND_DASHBOARD_UPDATES.md](./NAVIGATION_AND_DASHBOARD_UPDATES.md)** - Navigation changes
- **[DASHBOARD_RENAME_SUMMARY.md](./DASHBOARD_RENAME_SUMMARY.md)** - "My Case Pipeline" renaming
- **[REMOVE_FORM_GENERATOR_TAB.md](./REMOVE_FORM_GENERATOR_TAB.md)** - Navigation simplification
- **[UNASSIGNED_BUTTON_FIX.md](./UNASSIGNED_BUTTON_FIX.md)** - Assignment dropdown fix
- **[BUTTON_TEXT_UPDATE.md](./BUTTON_TEXT_UPDATE.md)** - "Assign to Me" button updates

### SQL Migrations
- **[complete-commissioners-setup.sql](./complete-commissioners-setup.sql)** - Commissioner database
- **[add-pdf-storage.sql](./add-pdf-storage.sql)** - PDF storage columns
- **[FIX_MISSING_STATUS_COLUMN.sql](./FIX_MISSING_STATUS_COLUMN.sql)** - Status tracking columns
- **[add-brenna-kantrovitz.sql](./add-brenna-kantrovitz.sql)** - LinkedIn profile
- **[add-robert-barton.sql](./add-robert-barton.sql)** - CDCR profile

---

## 📊 Database Schema

**Core Tables:**
- `transcripts` - Uploaded transcripts with metadata + PDF URLs
- `predictions` - AI analysis results
- `volunteers` - User accounts
- `commissioners` - 23+ BPH commissioners with backgrounds
- `case_assignments` - Assignment tracking
- `case_notes` - Volunteer annotations
- `commissioner_hearings` - Hearing assignments
- `commissioner_statistics` - Performance metrics

**New Columns:**
- `transcripts.status` - assigned | in_review | completed | flagged | unassigned
- `transcripts.assigned_to` - Volunteer ID
- `transcripts.assigned_at` - Assignment timestamp
- `transcripts.form_data` - Generated form JSON
- `transcripts.pdf_url` - Supabase Storage URL
- `transcripts.pdf_file_size` - File size in bytes
- `commissioners.background_category` - Background type
- `commissioners.background_details` - Detailed background info
- `commissioners.profile_url` - LinkedIn or CDCR profile link

See `complete-commissioners-setup.sql` for full schema.

---

## 🐛 Troubleshooting

### Common Issues

**AI insights not loading:**
- Check `VITE_GEMINI_API_KEY` in `.env`
- Verify API key at https://aistudio.google.com
- Check browser console for errors
- Insights load progressively (first 20 cards, then batches of 5)

**Cases not moving between Kanban columns:**
- Verify `status`, `assigned_to`, `assigned_at`, `form_data` columns exist
- Run `FIX_MISSING_STATUS_COLUMN.sql` in Supabase SQL Editor
- Check browser console for update errors

**Commissioner backgrounds showing "Unknown":**
- Run `complete-commissioners-setup.sql` to populate database
- Verify commissioners table has 23+ rows
- Check `background_category` and `background_details` columns exist

**PDF "View Full Transcript" not working:**
- Run `add-pdf-storage.sql` to add PDF columns
- Create `transcript-pdfs` bucket in Supabase Storage
- Set bucket to public access
- Re-upload transcripts to generate PDF URLs

**"No inmate speech found":**
- Check transcript formatting
- Ensure speaker labels exist (e.g., "INMATE:", "DEFENDANT:")
- Check browser console for diagnostics

**Port conflict (port 3000 in use):**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
# Or use different port
PORT=3003 npm run dev
```

---

## 📈 Performance

**Analysis Time:**
- Small transcript (< 5 pages): 10-20 seconds
- Medium (5-15 pages): 30-60 seconds
- Large (15+ pages): 1-3 minutes

**AI Insights Generation:**
- First 20 cards: 20-40 seconds
- Progressive loading in batches of 5
- Cached per session (no re-generation on navigation)

**API Limits:**
- Gemini 2.0 Flash Lite: 15 requests/minute (free tier)
- Built-in delay: 2 seconds between chunks
- Batch processing to avoid rate limits

**Optimization:**
- Lazy loading for route-based code splitting
- Memoization of expensive calculations
- N+1 query resolution (single JOIN queries)
- Progressive loading of AI insights

---

## 🤝 Contributing

This project was built for Hack for Social Good 2025. Contributions welcome!

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run linter: `npm run lint`
5. Build: `npm run build`
6. Commit: `git commit -m "Add amazing feature"`)
7. Push: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Code Style
- TypeScript strict mode enabled
- ESLint configuration included
- Tailwind CSS for styling
- shadcn/ui for components

---

## 🎯 Recent Major Features

### ✅ Completed (Latest)
- AI-generated innocence insights on every client card
- Enhanced commissioner breakdown with database integration
- "My Case Pipeline" personalization (shows only your cases)
- Deep parsing memo generator with multi-pattern matching
- PDF storage and viewing with line/page citations
- Navigation simplification (removed Form Generator tab)
- Assignment dropdown properly shows "UNASSIGNED"
- All "Assign to Me" buttons updated for clarity
- Quick Actions section removed for cleaner dashboard
- Enhanced bias detection (15 patterns vs 5)
- Enhanced innocence detection (12 patterns vs 6)
- Commissioner profile pages with LinkedIn/CDCR links
- Real-time validation logging for 294 transcripts

---

## 📝 License

This project is part of Hack for Social Good 2025. License TBD.

---

## 🙏 Acknowledgments

- **Hack for Social Good 2025** - Hackathon host
- **Google Gemini** - AI analysis engine
- **Supabase** - Database and storage infrastructure
- **shadcn/ui** - Beautiful component library
- **California Board of Parole Hearings** - Commissioner data

---

## 📞 Support

For questions or issues:
1. Check the documentation markdown files in the project root
2. Review SQL migration files for database setup
3. Check browser console for errors
4. Verify environment variables in `.env`
5. Open an issue on GitHub

---

**Built with ❤️ for social justice and wrongful conviction advocacy**

**GitHub:** https://github.com/kaiwenzhou/innocence-grid

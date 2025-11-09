# JusticeMAP - AI-Powered Wrongful Conviction Analysis Platform

A comprehensive platform combining **AI-powered innocence detection** with **multi-user case management** for analyzing parole hearing transcripts and identifying potential wrongful convictions.

## 🎯 Overview

This project merges two powerful systems:

1. **Innocence Grid** - Gemini AI-powered transcript analysis with intelligent chunking
2. **JusticeMAP** - Multi-user UI with volunteer management, commissioner analysis, and case tracking

**Result:** A production-ready platform that helps volunteers identify and prioritize cases with strong innocence signals.

---

## ✨ Key Features

### 🤖 AI-Powered Innocence Detection
- **Gemini 2.0 Flash Lite** integration for advanced natural language analysis
- **Intelligent transcript chunking** preserving speaker context
- **4 signal types detected:**
  - Explicit claims ("I didn't do it")
  - Contextual signals (coerced confessions, evidence gaps)
  - Implicit signals (maintained innocence)
  - Bias language (institutional patterns)
- **Weighted scoring algorithm** (40% explicit, 30% contextual, 20% implicit, 10% bias)

### 👥 Multi-User Collaboration
- Volunteer authentication and role-based access
- Case assignment workflow
- Collaborative case notes
- Team analytics and insights

### 📊 Commissioner Analysis
- Database of 21 California BPH commissioners
- Background categorization (Law Enforcement, Prosecution, Legal, Mental Health, etc.)
- Bias risk detection based on panel composition
- Commissioner performance tracking

### 📝 Automated Form Generation
- Extract key facts from transcripts
- Auto-generate legal intake forms
- One-click copy/download functionality

### 🎯 Priority Recommendations
- AI-driven case ranking (0-100 score)
- Multi-factor algorithm:
  - Innocence claim strength (uses AI when available)
  - Commissioner bias risk
  - Case urgency (hearing date)
  - Assignment status
- Top 3 recommendations on dashboard

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
   - Run the entire `database-merged-setup.sql` file
   - Verify tables were created

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add:
   # - VITE_SUPABASE_URL
   # - VITE_SUPABASE_ANON_KEY
   # - VITE_GEMINI_API_KEY
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

   Visit http://localhost:8080

### First Steps

1. **Upload a transcript** (PDF or TXT format)
2. **View transcript detail** and click "Analyze with AI"
3. **Wait for analysis** (progress bar shows status)
4. **Review results** (innocence score and detected signals)
5. **Check dashboard** for AI-powered priority recommendations

---

## 📁 Project Structure

```
innocence-grid/
├── src/
│   ├── services/           # Backend logic
│   │   ├── gemini.ts                # Gemini API integration
│   │   ├── innocenceDetector.ts     # Main analysis orchestrator
│   │   ├── priority.ts              # AI-powered priority scoring
│   │   ├── transcripts.ts           # Transcript CRUD operations
│   │   ├── commissioners.ts         # Commissioner database
│   │   ├── volunteers.ts            # User management
│   │   └── formProcessor.ts         # Form auto-generation
│   ├── utils/              # Utilities
│   │   ├── transcriptChunker.ts     # Intelligent chunking
│   │   ├── speakerParser.ts         # Speaker identification
│   │   └── transcriptPreprocessor.ts # Text cleanup
│   ├── pages/              # React pages
│   │   ├── Dashboard.tsx            # Overview + AI recommendations
│   │   ├── TranscriptDetail.tsx     # Analysis UI
│   │   ├── Upload.tsx               # File upload
│   │   ├── Transcripts.tsx          # Transcript list
│   │   ├── Login.tsx                # Authentication
│   │   ├── Cases.tsx                # Case management
│   │   ├── CommissionerBreakdown.tsx # Bias analysis
│   │   └── FormGenerator.tsx        # Legal forms
│   ├── components/         # UI components
│   └── lib/                # Types, config, utils
├── database-merged-setup.sql  # Complete database schema
├── MERGE_GUIDE.md            # Detailed merge documentation
└── README.md                 # This file
```

---

## 🛠 Tech Stack

**Frontend:**
- React 18 + TypeScript 5.8
- Vite 5.4 (build tool)
- Tailwind CSS 3.4 (styling)
- shadcn/ui (50+ components)
- React Router 6 (navigation)

**Backend:**
- Supabase (PostgreSQL database + auth)
- Google Generative AI (Gemini 2.0 Flash Lite)
- TanStack React Query (data fetching)

**Additional:**
- PDF.js (PDF text extraction)
- Zod (validation)
- React Hook Form (form management)

---

## 📚 Documentation

- **[MERGE_GUIDE.md](./MERGE_GUIDE.md)** - Comprehensive merge documentation
- **[database-merged-setup.sql](./database-merged-setup.sql)** - Complete database schema
- **[.env.example](./.env.example)** - Environment variable template

### Additional Guides (JusticeMAP)
- START_HERE.md - Quick start guide
- AI_FEATURES_COMPLETE.md - Feature breakdown
- COMMISSIONER_SYSTEM_COMPLETE.md - Commissioner database
- VOLUNTEER_SYSTEM_COMPLETE.md - User management
- FORM_GENERATOR_GUIDE.md - Form auto-generation

---

## 🔍 How It Works

### AI Analysis Pipeline

```
1. Upload transcript (PDF/TXT)
      ↓
2. Extract metadata (hearing date, inmate name, CDCR number)
      ↓
3. User clicks "Analyze with AI"
      ↓
4. Preprocess text (remove line numbers, normalize)
      ↓
5. Parse speaker turns (INMATE, COURT, ATTORNEY, etc.)
      ↓
6. Chunk transcript (~8K tokens/chunk, preserving context)
      ↓
7. For each chunk:
   - Send to Gemini 2.0 Flash Lite
   - Detect 4 signal types
   - Pass context to next chunk
      ↓
8. Aggregate results + calculate weighted score
      ↓
9. Store in predictions table
      ↓
10. Display in UI (score, signals, risk level)
```

### Priority Scoring

Cases are ranked 0-100 based on:
- **Innocence strength** (0-30 pts) - Uses AI score when available
- **Bias risk** (0-25 pts) - Commissioner panel composition
- **Urgency** (0-25 pts) - How recent the hearing was
- **Status** (0-20 pts) - Unassigned = higher priority

---

## 🎨 Screenshots

### Dashboard with AI Recommendations
![Dashboard showing top 3 AI-ranked cases](placeholder)

### Transcript Analysis
![Innocence score with detected signals](placeholder)

### Commissioner Breakdown
![Bias analysis by commissioner background](placeholder)

---

## 🤝 Contributing

This project was built for a hackathon and is actively being developed. Contributions welcome!

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests: `npm run lint`
5. Build: `npm run build`
6. Commit: `git commit -m "Add amazing feature"`
7. Push: `git push origin feature/amazing-feature`
8. Open a Pull Request

---

## 📊 Database Schema

**Core Tables:**
- `transcripts` - Uploaded transcripts with metadata
- `predictions` - AI analysis results
- `volunteers` - User accounts
- `commissioners` - BPH commissioner database
- `case_assignments` - Assignment tracking
- `case_notes` - Volunteer annotations
- `commissioner_hearings` - Hearing assignments
- `commissioner_statistics` - Performance metrics

See `database-merged-setup.sql` for full schema.

---

## 🐛 Troubleshooting

### Common Issues

**Build fails:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

**"No inmate speech found":**
- Check transcript formatting
- Ensure speaker labels exist (e.g., "INMATE:", "DEFENDANT:")
- Check browser console for diagnostics

**Gemini API errors:**
- Verify API key in `.env`
- Check quota at https://aistudio.google.com
- Key should start with "AIza..."

**Predictions not showing:**
- Verify `predictions` table exists in database
- Check if `transcript.processed = true`
- Click "Analyze with AI" to run analysis

---

## 📈 Performance

**Analysis Time:**
- Small transcript (< 5 pages): 10-20 seconds
- Medium (5-15 pages): 30-60 seconds
- Large (15+ pages): 1-3 minutes

**API Limits:**
- Gemini 2.0 Flash Lite: 15 requests/minute
- Built-in delay: 2 seconds between chunks

---

## 📝 License

This project is part of a hackathon submission. License TBD.

---

## 🙏 Acknowledgments

- **Innocence Grid** - Original AI backend implementation
- **JusticeMAP** - UI and multi-user features
- **Anthropic Claude** - Merge orchestration
- **Google Gemini** - AI analysis engine
- **Supabase** - Database infrastructure

---

## 📞 Support

For questions or issues:
1. Check the [MERGE_GUIDE.md](./MERGE_GUIDE.md)
2. Review database setup
3. Check browser console for errors
4. Verify environment variables

**Built with ❤️ for social justice**

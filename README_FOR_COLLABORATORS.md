# 🎯 JusticeMAP - Parole Transcript Analysis Platform

> **Proactive client discovery + case triage + narrative support for wrongfully convicted individuals**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF.svg)](https://vitejs.dev/)

---

## 🌟 What is JusticeMAP?

**JusticeMAP** (Minimum Actionable Packet + Narrative + Case Progression Platform) transforms buried parole hearing transcripts into actionable leads, structured case summaries, and human-centered parole preparation support.

This platform helps innocence advocacy organizations:
- 🔍 **Identify** wrongfully convicted individuals from parole transcripts
- 📊 **Analyze** commissioner bias and decision patterns
- 📝 **Support** applicants in building compelling parole narratives
- 📈 **Track** systemic biases for policy advocacy

---

## ✨ Key Features

### 1. **Client Discovery**
- Card-based client interface
- AI-powered innocence claim extraction
- Intelligent case strength scoring
- Real-time search and filtering

### 2. **Case Analysis**
- Split-panel transcript viewer
- Commissioner bias detection
- Panel composition tracking
- Bias language highlighting

### 3. **Transcript Management**
- Professional table interface
- Bulk upload support
- Metadata extraction
- Status tracking

### 4. **Commissioner Bias Analysis** 🎯
- Track commissioner backgrounds (law enforcement, prosecution, mental health, etc.)
- Identify bias patterns in denial language
- Generate advocacy reports for policy change
- Evidence-based insights for systemic reform

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites

- **Node.js** 18+ ([Download here](https://nodejs.org/))
- **Git** ([Download here](https://git-scm.com/))
- **Supabase Account** (Free - [Sign up here](https://supabase.com))

### Setup Steps

1. **Clone this repository**
   ```bash
   git clone https://github.com/YOUR-USERNAME/JusticeMAP.git
   cd JusticeMAP
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up your database**
   - Create a free account at [Supabase](https://supabase.com)
   - Create a new project
   - Go to SQL Editor and run the contents of `database-setup.sql`

4. **Configure environment variables**
   ```bash
   # Copy the template
   cp ENV_TEMPLATE.txt .env
   
   # Edit .env and add your Supabase credentials:
   # VITE_SUPABASE_URL=your-project-url
   # VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:8080
   ```

---

## 📁 Project Structure

```
JusticeMAP/
├── src/
│   ├── pages/              # Main application pages
│   │   ├── Clients.tsx     # Client card interface
│   │   ├── Cases.tsx       # Case analysis view
│   │   ├── Transcripts.tsx # Transcript management
│   │   └── Dashboard.tsx   # Overview dashboard
│   ├── components/         # Reusable UI components
│   │   ├── layout/         # Layout components
│   │   └── ui/             # shadcn/ui components
│   ├── services/           # API & data services
│   │   └── transcripts.ts  # Transcript operations
│   ├── lib/                # Utilities & types
│   │   ├── supabase.ts     # Supabase client
│   │   ├── types.ts        # TypeScript interfaces
│   │   └── utils.ts        # Helper functions
│   └── index.css           # Global styles (color scheme)
├── database-setup.sql      # Database schema
└── package.json            # Dependencies
```

---

## 🎨 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn/ui + Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **PDF Processing**: pdfjs-dist
- **Routing**: React Router
- **State Management**: React Hooks

---

## 🎨 Design Philosophy

### Color Scheme: Rehabilitation & Growth
- **Lavender** (#8B7BB8): Progress and post-rehabilitation growth
- **Warm Beige/Cream**: Calm, neutral, non-punitive
- **Soft Sage**: Hope and renewal
- **Muted Tones**: Professional and approachable

> **Why not blue?** Blue tones can feel punitive and law enforcement-focused. Our palette emphasizes rehabilitation, dignity, and hope.

---

## 🗄️ Database Schema

### `transcripts` Table
```sql
- id (TEXT, Primary Key)
- file_name (TEXT)
- raw_text (TEXT)
- hearing_date (DATE)
- inmate_name (TEXT)
- cdcr_number (TEXT)
- processed (BOOLEAN)
- uploaded_at (TIMESTAMP)
```

### `predictions` Table
```sql
- id (SERIAL, Primary Key)
- transcript_id (TEXT, Foreign Key)
- innocence_score (REAL)
- explicit_claims (JSONB)
- implicit_signals (JSONB)
- model_version (TEXT)
- analyzed_at (TIMESTAMP)
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Get these values from:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Settings → API
4. Copy "Project URL" and "anon public" key

---

## 📦 Available Scripts

```bash
# Development
npm run dev          # Start dev server (http://localhost:8080)

# Build
npm run build        # Production build
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
```

---

## 🛠️ Development Workflow

### 1. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes
Edit files in `src/` directory

### 3. Test Locally
```bash
npm run dev
```

### 4. Commit Your Changes
```bash
git add .
git commit -m "Add: your feature description"
```

### 5. Push to GitHub
```bash
git push origin feature/your-feature-name
```

### 6. Create a Pull Request
Go to GitHub and create a PR from your branch

---

## 📊 Key Features to Implement

### ✅ Already Built
- [x] Client card interface
- [x] Transcript table with search/filter
- [x] Real-time data from Supabase
- [x] Innocence claim extraction
- [x] Case strength calculation
- [x] Modern, rehabilitation-focused UI

### 🚧 In Progress
- [ ] Commissioner bias analysis
- [ ] Analyse page (AI-powered)
- [ ] Narrative coaching workspace
- [ ] Policy advocacy dashboard

### 🎯 Future Enhancements
- [ ] ML-based innocence scoring
- [ ] Automated commissioner detection
- [ ] Bias pattern visualization
- [ ] Export for legal CRM (Lawmatics/Clio)
- [ ] PDF generation for parole packets

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Report Bugs**: Open an issue with details
2. **Suggest Features**: Share your ideas in discussions
3. **Submit PRs**: Follow the workflow above
4. **Improve Docs**: Help make setup easier

### Code Style
- Use TypeScript for type safety
- Follow existing component patterns
- Keep components small and focused
- Write clear commit messages

---

## 🔒 Privacy & Security

### ⚠️ Important Security Notes

**DO NOT COMMIT**:
- `.env` file (Supabase credentials)
- PDF transcript files (contain PII)
- Client names or personal information
- Database passwords or API keys

**Already Protected**:
- ✅ `.env` is in `.gitignore`
- ✅ `*.pdf` files are ignored
- ✅ Data folders are excluded

### Best Practices
- Each developer uses their own Supabase instance for testing
- Production database access is restricted
- Never hardcode credentials
- Use environment variables for all secrets

---

## 📚 Additional Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - 5-minute setup guide
- **[DATABASE_SETUP_COMPLETE.md](./DATABASE_SETUP_COMPLETE.md)** - Database reference
- **[REAL_DATA_INTEGRATION.md](./REAL_DATA_INTEGRATION.md)** - Data flow explanation
- **[SHARE_WITH_COLLABORATOR.md](./SHARE_WITH_COLLABORATOR.md)** - Collaboration guide

---

## 🎓 Learning Resources

### New to the Stack?
- [React Tutorial](https://react.dev/learn)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)

---

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
- Make sure you created `.env` file
- Check that variable names match exactly
- Restart dev server after changing `.env`

### "No transcripts found"
- Verify your Supabase credentials
- Check that tables were created (`database-setup.sql`)
- Look for errors in browser console (F12)

### Port already in use
- Kill existing process: `lsof -ti:8080 | xargs kill`
- Or use different port: `npm run dev -- --port 3000`

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/YOUR-USERNAME/JusticeMAP/issues)
- **Discussions**: [GitHub Discussions](https://github.com/YOUR-USERNAME/JusticeMAP/discussions)
- **Email**: your-email@example.com

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- Built for innocence advocacy organizations
- Inspired by the need for systemic transparency in parole decisions
- Designed with input from formerly incarcerated individuals and advocates
- Color scheme informed by rehabilitation psychology research

---

## 🎯 Mission

**JusticeMAP exists to transform the parole system from opaque to transparent, from punitive to rehabilitative, and from individual advocacy to systemic change.**

Every denied parole hearing contains data. Every commissioner's background tells a story. Every pattern of bias is evidence for reform.

**This platform turns that data into action.**

---

## 🚀 Getting Started Checklist

- [ ] Clone the repository
- [ ] Install Node.js 18+
- [ ] Run `npm install`
- [ ] Create Supabase account
- [ ] Run `database-setup.sql` in Supabase SQL Editor
- [ ] Create `.env` file with your credentials
- [ ] Run `npm run dev`
- [ ] Open http://localhost:8080
- [ ] Upload a test transcript
- [ ] Explore the Clients page

**Ready to make an impact? Let's build JusticeMAP together!** 🎉

---

**Last Updated**: November 9, 2025  
**Version**: 1.0.0  
**Status**: Active Development


# 🤝 Sharing JusticeMAP with Collaborators

## Quick Start for New Collaborators

This guide will help you share your JusticeMAP project with a friend or collaborator.

---

## Option 1: Share the Entire Project (Recommended)

### Step 1: Create a New GitHub Repository

1. **Go to GitHub**: https://github.com/new
2. **Repository name**: `JusticeMAP` (or your preferred name)
3. **Description**: "Parole Transcript Analysis & Advocacy Platform for Wrongful Conviction Cases"
4. **Visibility**: 
   - **Private** ← Recommended (contains sensitive case data structure)
   - OR **Public** (if you want to open-source it)
5. **DO NOT** initialize with README (we already have files)
6. Click **"Create repository"**

### Step 2: Push Your Code to the New Repo

Open Terminal and run these commands:

```bash
cd /Users/rienespecial/Desktop/HackforSocialGood

# Initialize git if not already done
git init

# Add all files (except those in .gitignore)
git add .

# Create your first commit
git commit -m "Initial commit: JusticeMAP platform with 290 transcripts structure"

# Connect to your new GitHub repo (replace YOUR-USERNAME and YOUR-REPO-NAME)
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Invite Your Collaborator

1. Go to your new repo on GitHub
2. Click **Settings** → **Collaborators**
3. Click **Add people**
4. Enter their GitHub username or email
5. They'll receive an invitation

---

## Option 2: Export Database Data (Commissioner Profiles)

### Export Commissioner Profiles from Supabase

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard/project/qymvmcxnwdkegdctxibi
2. **Table Editor** → Select your table (e.g., `commissioner_profiles`)
3. Click **"..."** menu → **Export as CSV**
4. Save the file as `commissioner_profiles_export.csv`

### Export Database Schema

The schema is already in your project:
- `database-setup.sql` - Full database structure

### Create a Data Package

Create a new folder to share:

```bash
# Create export folder
mkdir ~/Desktop/JusticeMAP-Export

# Copy database files
cp database-setup.sql ~/Desktop/JusticeMAP-Export/
cp DATABASE_SETUP_COMPLETE.md ~/Desktop/JusticeMAP-Export/
cp QUICKSTART.md ~/Desktop/JusticeMAP-Export/
cp ENV_TEMPLATE.txt ~/Desktop/JusticeMAP-Export/

# If you have commissioner data exported
cp commissioner_profiles_export.csv ~/Desktop/JusticeMAP-Export/

# Zip it
cd ~/Desktop
zip -r JusticeMAP-Export.zip JusticeMAP-Export/
```

Send the ZIP file to your friend!

---

## Option 3: Create a Separate "Commissioner Database" Repo

If you want to share ONLY the commissioner bias analysis as a standalone project:

### Step 1: Create Commissioner Profiles File

Create a CSV file with your commissioner data:

```csv
commissioner_name,background_category,appointed_by,appointment_date,reappointed_date,notes
Patricia Cassady,Parole Board Administration,Brown,2016-11-23,2023-05-25,Long-term BPH experience
Kevin Chappell,Corrections & Law Enforcement,Brown,2016-01-04,2023-08-22,Warden at San Quentin
Dianne Dobbs,Legal Judicial & Mixed Legal,Brown,2017-12-08,2021-08-06,Child advocate background
Julie Garland,Prosecution & State's Attorney,Newsom,2021-10-27,,Senior AG
Gilbert Infante,Corrections & Law Enforcement,Newsom,2023-06-13,,Juvenile justice background
Teal Kozel,Mental Health,Newsom,2022-04-20,2023-04-13,Clinical psychologist
David Long,Corrections & Law Enforcement,Brown,2018-01-19,2021-08-06,Prison engagement advocate
Michele Minor,Corrections & Law Enforcement,Brown,2014-11,2021-08-06,Rehabilitative programs
William Muniz,Corrections & Law Enforcement,Newsom,2022-04-20,2023-04-13,Prison to Employment Initiative
David Ndudim,Legal Judicial & Mixed Legal,Newsom,2022-04-20,2023-04-13,Defense attorney experience
Kathleen O'Meara,Mental Health,Newsom,2021-10-27,2023-08-22,Clinical/forensic psychologist
Catherine Purcell,Prosecution & State's Attorney,Newsom,2021-10-27,2023-08-22,Former judge
Michael Ruff,Corrections & Law Enforcement,Brown,2017-01-20,2023-05-25,Correctional officer background
Rosalind Sargent-Burns,Legal Judicial & Mixed Legal,Newsom,2025-08-28,,Pardon attorney
Neil Schneider,Corrections & Law Enforcement,Brown,2018-07-06,2023-08-22,Police captain
Excel Sharrieff,Legal Judicial & Mixed Legal,Brown,2018-12-05,2021-08-06,Defense attorney
Emily Sheffield,Legal Judicial & Mixed Legal,Newsom,2024-02-20,,Exoneration project volunteer
Troy Taira,Legal Judicial & Mixed Legal,Brown,2018-05-30,2021-08-06,Public defender
Mary Thornton,Prosecution & State's Attorney,Newsom,2019-08-12,2023-05-25,Deputy DA
Jack Weiss,Prosecution & State's Attorney,Newsom,2022-08-19,,Assistant US Attorney
```

### Step 2: Create a New Repo for Commissioner Data

1. Create repo: `CaliforniaParoleBoardBiasTracker`
2. Upload:
   - `commissioner_profiles.csv`
   - `README.md` explaining the bias analysis
   - `analysis.md` with your findings
   - `methodology.md` explaining categorization

---

## What NOT to Share (Privacy & Security)

🚨 **DO NOT** commit or share these files:

### Never Share:
- `.env` file (contains your Supabase credentials!)
- Actual transcript PDFs (contain PII - Personal Identifiable Information)
- Client names, CDCR numbers, or case details
- Your Supabase password or API keys

### Safe to Share:
- ✅ Source code (`src/` folder)
- ✅ Database schema (`database-setup.sql`)
- ✅ Setup instructions (all .md files)
- ✅ Commissioner profiles (public information)
- ✅ Package.json and dependencies

---

## Setting Up for Your Collaborator

### What They'll Need:

1. **Their own Supabase account** (free)
   - They should create a NEW project
   - Run the `database-setup.sql` in their Supabase
   - Create their own `.env` file with their credentials

2. **Node.js installed** (v18 or later)

3. **Your GitHub repo access** (if you made it private)

### Their Setup Steps:

```bash
# 1. Clone the repo
git clone https://github.com/YOUR-USERNAME/JusticeMAP.git
cd JusticeMAP

# 2. Install dependencies
npm install

# 3. Create .env file
# Copy from ENV_TEMPLATE.txt
# Add their own Supabase credentials

# 4. Start development server
npm run dev
```

---

## Collaboration Best Practices

### Using GitHub Together:

1. **Create branches** for new features:
   ```bash
   git checkout -b feature/commissioner-analysis
   ```

2. **Commit often** with clear messages:
   ```bash
   git add .
   git commit -m "Add commissioner bias score calculation"
   ```

3. **Push your branch**:
   ```bash
   git push origin feature/commissioner-analysis
   ```

4. **Create Pull Requests** on GitHub for review

### Database Collaboration:

- **Option A**: Share one Supabase project (add them as team member)
- **Option B**: Each person has their own Supabase (for testing)
- **Option C**: Use separate "dev" and "production" databases

---

## Quick Commands Reference

### Push Updates to GitHub:
```bash
git add .
git commit -m "Your update description"
git push
```

### Pull Latest Changes:
```bash
git pull
```

### Create New Branch:
```bash
git checkout -b feature-name
```

### Share Supabase Access:
1. Supabase Dashboard → Settings → Team
2. Invite team member
3. They get read/write access to your database

---

## Next Steps After Sharing

1. **Schedule a kickoff call** to walk through the codebase
2. **Divide tasks**:
   - You: Commissioner bias analysis feature
   - Them: Narrative coaching module
3. **Set up project management** (GitHub Projects, Trello, etc.)
4. **Establish code review process**
5. **Create a contribution guide**

---

## Need Help?

If your collaborator gets stuck, they can:
1. Check `QUICKSTART.md` for setup
2. Check `DATABASE_SETUP_COMPLETE.md` for database issues
3. Check `REAL_DATA_INTEGRATION.md` for data flow
4. Create a GitHub Issue in your repo

---

**Ready to collaborate on JusticeMAP and make a real impact!** 🚀


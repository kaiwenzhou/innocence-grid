# 📤 Export JusticeMAP to GitHub - Step by Step

## ✅ Your Project is Ready to Share!

All sensitive data has been protected. Only the UI code will be shared.

---

## 🚀 Quick Export (3 Steps)

### Step 1: Create a New GitHub Repository

1. Go to: https://github.com/new

2. Fill in the details:
   - **Repository name**: `JusticeMAP` (or your preferred name)
   - **Description**: "Parole Transcript Analysis & Advocacy Platform for Wrongful Conviction Cases"
   - **Visibility**: 
     - **Private** ✅ (Recommended for now)
     - OR Public (if you want it open-source)
   - **DO NOT** check "Add a README file"
   - **DO NOT** check "Add .gitignore"
   - **DO NOT** check "Choose a license"

3. Click **"Create repository"**

4. **Copy the repository URL** shown on the next page (looks like: `https://github.com/YOUR-USERNAME/JusticeMAP.git`)

---

### Step 2: Push Your Code to GitHub

Open Terminal and run these commands **one by one**:

```bash
# Navigate to your project
cd /Users/rienespecial/Desktop/HackforSocialGood

# Check git status (see what will be committed)
git status

# Add all files (PDFs are automatically excluded by .gitignore)
git add .

# Create your first commit
git commit -m "Initial commit: JusticeMAP UI with client discovery, case analysis, and bias tracking features"

# Connect to your GitHub repository
# Replace YOUR-USERNAME and YOUR-REPO-NAME with your actual GitHub username and repo name
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**That's it!** Your code is now on GitHub! 🎉

---

### Step 3: Invite Your Collaborator

1. Go to your new repository on GitHub
2. Click **"Settings"** tab
3. Click **"Collaborators"** in the left sidebar
4. Click **"Add people"**
5. Enter their GitHub username or email
6. Click **"Add [username] to this repository"**
7. They'll receive an email invitation

---

## 🔍 What Gets Pushed to GitHub

### ✅ Included (Shared):
- ✅ All React/TypeScript source code (`src/` folder)
- ✅ UI components and pages
- ✅ Database schema (`database-setup.sql`)
- ✅ Package.json and dependencies
- ✅ Setup documentation (all .md files)
- ✅ Tailwind config and styles
- ✅ Vite configuration
- ✅ ENV_TEMPLATE.txt (example only)

### ❌ Excluded (Protected):
- ❌ `.env` file (your Supabase credentials)
- ❌ `*.pdf` files (transcript data)
- ❌ `node_modules/` (dependencies, can be reinstalled)
- ❌ `dist/` (build output)
- ❌ Any transcript data folders
- ❌ Database files (*.db, *.sqlite)

---

## 👥 What Your Collaborator Needs to Do

Share these instructions with your friend:

### For Your Friend: Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR-USERNAME/JusticeMAP.git
   cd JusticeMAP
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create their own Supabase account**
   - Go to https://supabase.com
   - Sign up (free)
   - Create a new project
   - Wait 2 minutes for it to set up

4. **Set up the database**
   - In Supabase dashboard, go to SQL Editor
   - Copy the contents of `database-setup.sql` from the repo
   - Paste and run it

5. **Create .env file**
   ```bash
   # Copy the template
   cp ENV_TEMPLATE.txt .env
   ```
   
   Then edit `.env` and add their Supabase credentials:
   - Get URL from: Supabase → Settings → API → Project URL
   - Get Key from: Supabase → Settings → API → anon/public key

6. **Start the dev server**
   ```bash
   npm run dev
   ```

7. **Open browser**
   ```
   http://localhost:8080
   ```

**They're ready to code!** 🚀

---

## 🔄 Ongoing Collaboration

### Pulling Latest Changes

When you push updates, your friend runs:
```bash
git pull
```

### Pushing Their Changes

When they make changes:
```bash
git add .
git commit -m "Description of changes"
git push
```

### Working on Branches (Recommended)

To avoid conflicts:

**You:**
```bash
git checkout -b feature/commissioner-analysis
# Make changes
git push origin feature/commissioner-analysis
```

**Your Friend:**
```bash
git checkout -b feature/narrative-coaching
# Make changes
git push origin feature/narrative-coaching
```

Then create Pull Requests on GitHub to review and merge!

---

## 🛠️ Troubleshooting

### "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
```

### "Updates were rejected"
```bash
git pull origin main --rebase
git push origin main
```

### "Permission denied"
- Make sure you're logged into GitHub in your browser
- Or use SSH: `git remote set-url origin git@github.com:YOUR-USERNAME/YOUR-REPO-NAME.git`

### "Large files detected"
- This shouldn't happen (PDFs are ignored)
- If it does: `git reset HEAD~1` and check `.gitignore`

---

## 📊 What Your Friend Will See

After cloning, they'll have:

```
JusticeMAP/
├── src/                          ✅ All UI code
├── database-setup.sql            ✅ Database schema
├── package.json                  ✅ Dependencies list
├── README_FOR_COLLABORATORS.md   ✅ Setup guide
├── QUICKSTART.md                 ✅ Quick start
├── ENV_TEMPLATE.txt              ✅ Example .env
├── .gitignore                    ✅ Protection rules
├── NO .env file                  ❌ They create their own
├── NO node_modules/              ❌ They run npm install
├── NO transcript PDFs            ❌ Not shared
```

---

## 🎯 Collaboration Options

### Option 1: Separate Databases (Recommended for Development)
- You have your own Supabase with your 290 transcripts
- Your friend has their own Supabase with test data
- No conflicts, everyone works independently
- Merge code changes via GitHub

### Option 2: Shared Database
- Add your friend to your Supabase project
- Go to Supabase → Settings → Team
- Invite their email
- They use YOUR credentials in their `.env`
- ⚠️ Be careful with data changes!

### Option 3: Hybrid
- Shared database for reading/testing
- Separate databases for development
- Production database only you control

---

## 📝 After Pushing to GitHub

**Tell your friend:**

1. **Repository URL**: `https://github.com/YOUR-USERNAME/YOUR-REPO-NAME`

2. **What to read first**:
   - `README_FOR_COLLABORATORS.md` - Full overview
   - `QUICKSTART.md` - 5-minute setup

3. **They need**:
   - Node.js 18+ installed
   - Their own Supabase account (free)
   - 10 minutes to set up

4. **First task ideas**:
   - Upload a test transcript
   - Explore the Clients page
   - Try the Cases analysis view
   - Read the code in `src/pages/`

---

## ✅ Checklist Before Sharing

- [x] `.gitignore` updated to exclude PDFs
- [x] `.env` file is ignored
- [x] README created for collaborators
- [x] Database schema documented
- [x] ENV template provided
- [x] All code committed locally

Ready to run the commands in **Step 2** above!

---

## 🎉 Success!

Once pushed, your repository will be at:
```
https://github.com/YOUR-USERNAME/YOUR-REPO-NAME
```

Your friend can clone it immediately and start contributing!

---

## 🚀 Next Steps After Export

1. **Review the code together** - Schedule a call
2. **Divide tasks** - Use GitHub Issues or Projects
3. **Set up PR review process** - Review each other's code
4. **Build the next features**:
   - Commissioner bias analysis
   - Analyse page
   - Narrative coaching workspace
   - Policy advocacy dashboard

**Let's build JusticeMAP together!** 🎯


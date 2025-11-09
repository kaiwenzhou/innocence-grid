# JusticeMAP Codebase - Comprehensive Overview

## Project Summary
**JusticeMAP** is a React/TypeScript web application designed for analyzing court transcripts from parole hearings to identify potential wrongful convictions. The application uses AI-powered analysis to evaluate innocence claims in legal documents.

---

## 1. PROJECT STRUCTURE

```
/tmp/JusticeMAP/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── DashboardLayout.tsx      # Main layout wrapper with sidebar
│   │   │   └── AppSidebar.tsx           # Navigation sidebar
│   │   ├── ui/                          # 48 shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── table.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── ... (40+ more UI components)
│   │   └── NavLink.tsx                  # Custom nav link wrapper
│   ├── pages/
│   │   ├── Landing.tsx                  # Public landing page
│   │   ├── Dashboard.tsx                # Main dashboard
│   │   ├── Clients.tsx                  # Client list from transcripts
│   │   ├── Cases.tsx                    # Case analysis detail view
│   │   ├── Transcripts.tsx              # Transcript table/list
│   │   ├── TranscriptDetail.tsx         # Individual transcript view
│   │   ├── Upload.tsx                   # File upload interface
│   │   ├── NotFound.tsx                 # 404 page
│   │   └── Index.tsx                    # Blank template page
│   ├── services/
│   │   └── transcripts.ts               # Transcript service layer
│   ├── lib/
│   │   ├── types.ts                     # Type definitions
│   │   ├── supabase.ts                  # Supabase client setup
│   │   ├── utils.ts                     # Utility functions
│   │   └── mockData.ts                  # Mock transcript data
│   ├── hooks/
│   │   └── use-toast.ts                 # Toast notification hook
│   ├── App.tsx                          # Main app router
│   ├── main.tsx                         # Entry point
│   └── index.css                        # Tailwind CSS + theme
├── public/
│   ├── favicon.ico
│   ├── placeholder.svg
│   └── robots.txt
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── vite.config.ts
└── index.html
```

---

## 2. PAGES AND ROUTES

### Route Configuration (`/tmp/JusticeMAP/src/App.tsx`)

```tsx
Routes:
- /                      → Landing (public landing page)
- /dashboard            → Dashboard (main dashboard with stats)
- /clients              → Clients (extracted clients from transcripts)
- /cases                → Cases (case analysis detail view)
- /upload               → Upload (transcript file upload)
- /transcripts          → Transcripts (transcript list table)
- /transcript/:id       → TranscriptDetail (individual transcript view)
- *                     → NotFound (catch-all 404)
```

### Key Pages:

#### 1. **Landing.tsx** (`/`)
- Public-facing hero page
- Features section with 3 steps:
  1. Upload Transcripts
  2. AI Analysis
  3. Review Results
- Call-to-action buttons linking to dashboard
- Icons: Scale, Upload, Search, BarChart3

#### 2. **Dashboard.tsx** (`/dashboard`)
- Main dashboard with statistics
- Shows: Total Cases, Processed, Pending Review
- Quick action buttons (Upload New Case, View All Cases)
- Uses `DashboardLayout` component

#### 3. **Clients.tsx** (`/clients`)
- **Critical Page**: Lists clients extracted from parole hearing transcripts
- Features:
  - Grid of client cards (4 columns responsive)
  - Search by name, CDCR number, or filename
  - Filter dropdowns:
    - All Clients / Assigned / Unassigned
    - Case Strength (High/Medium/Low)
    - Sentence (Life / 25+ Years / Under 25 Years)
    - Categories (Domestic Violence / Murder / Assault)
  - Case strength calculation based on:
    - Has inmate name (+1)
    - Has CDCR number (+1)
    - Has hearing date (+1)
    - Substantial content >1000 chars (+1)
    - Contains innocence keywords (+1)
  - Status badges (New, In Progress, Closed)
  - Innocence claim extraction using regex patterns
  - Client cards show:
    - Inmate name, CDCR number
    - Status badge
    - Avatar with initials
    - Extracted innocence claim (truncated)
    - "View Case" and "Analyze" action buttons

#### 4. **Cases.tsx** (`/cases`)
- **Critical Page**: Case analysis detail view
- **Split-panel layout** (50/50 responsive):
  - **Left Panel**: Transcript content
    - Scrollable conversation between commissioners and applicant
    - Highlighted text sections (e.g., key innocence statements)
    - Identified tags/badges (Maintains Different Account, Rehabilitation Efforts, etc.)
  - **Right Panel**: Case Details with tabs:
    - **Overview**: Case summary, innocence indicators, recommended actions
    - **Panel Analysis**: Panel composition, bias risk assessment
    - **Timeline**: Case history timeline (conviction → hearings)
- Shows specific example: Emmanuel Young case (CDCR: AK2960)
- Innocence score display (e.g., 0.45 = Medium)
- Panel composition with background info on commissioners
- Bias risk assessment (e.g., "100% Law Enforcement/Corrections Panel")

#### 5. **Transcripts.tsx** (`/transcripts`)
- Table view of all transcripts
- Columns:
  - Checkbox
  - Transcript ID (padded with zeros)
  - Client Identified (inmate name)
  - Case Feasibility (high/medium/low)
  - Case Progress (Active, In progress, Closed, Not started)
  - Case In-Charge (mock: Ashton S, Kylie, Rohan, Yohan, Jenny Cao)
  - Case Status
  - Actions (dropdown menu)
- Sortable columns
- Filters same as Clients page
- Row click navigates to transcript detail

#### 6. **TranscriptDetail.tsx** (`/transcript/:id`)
- Individual transcript view with metadata
- Shows:
  - Hearing date, inmate name, CDCR number
  - Processed status
  - **Innocence Assessment** (if prediction exists):
    - Innocence score percentage
    - Risk badge (High/Medium/Low)
    - Explicit claims (with confidence scores)
    - Implicit signals
  - Full transcript text (scrollable)
- Back button to transcripts list

#### 7. **Upload.tsx** (`/upload`)
- Drag-and-drop file upload interface
- Supported file types: `.txt`, `.pdf`
- Multiple file support
- Upload progress tracking with progress bars
- Status indicators:
  - Pending (waiting)
  - Uploading (percentage)
  - Success (checkmark)
  - Error (red X)
- Error messages for each file
- Auto-redirect to transcripts on success
- Uses `TranscriptService.uploadTranscript()`

#### 8. **NotFound.tsx** (`/*`)
- 404 error page
- Basic error handling with return-to-home link

---

## 3. NAVIGATION STRUCTURE

### AppSidebar.tsx (`/tmp/JusticeMAP/src/components/layout/AppSidebar.tsx`)

**Branding**: 
- Logo: `Scale` icon (from lucide-react)
- Text: "JusticeMAP" (displayed when sidebar open)

**Navigation Items**:
1. Dashboard (Home icon) → `/dashboard`
2. Clients (Users icon) → `/clients`
3. Cases (Briefcase icon) → `/cases`
4. Transcripts (FileText icon) → `/transcripts`
5. **Analyse** (BarChart3 icon) → `/analyze` ⚠️ **PLACEHOLDER - Not implemented**
6. **Narratives** (BookText icon) → `/narratives` ⚠️ **PLACEHOLDER - Not implemented**
7. **Policy Making Data** (TrendingUp icon) → `/policy-data` ⚠️ **PLACEHOLDER - Not implemented**

**Sidebar Features**:
- Collapsible (icon-only when closed)
- Active route highlighting
- Navigation group label: "Navigation"
- Hover effects

---

## 4. TYPE DEFINITIONS

### `/tmp/JusticeMAP/src/lib/types.ts`

```typescript
// Database schema types
interface Database {
  public: {
    Tables: {
      transcripts: {
        Row: {
          id: string;
          file_name: string;
          raw_text: string;
          hearing_date: string | null;
          inmate_name: string | null;
          cdcr_number: string | null;
          processed: boolean;
          uploaded_at: string;
        };
        Insert: { ... };
        Update: { ... };
      };
      predictions: {
        Row: {
          id: number;
          transcript_id: string;
          innocence_score: number | null;
          explicit_claims: any; // JSONB
          implicit_signals: any; // JSONB
          model_version: string | null;
          analyzed_at: string;
        };
        Insert: { ... };
        Update: { ... };
      };
    };
  };
}

// Application types
interface Transcript {
  id: string;
  file_name: string;
  raw_text: string;
  hearing_date: string | null;
  inmate_name: string | null;
  cdcr_number: string | null;
  processed: boolean;
  uploaded_at: string;
  prediction?: Prediction;
}

interface Prediction {
  id: number;
  transcript_id: string;
  innocence_score: number | null;
  explicit_claims: any[];
  implicit_signals: any[];
  model_version: string | null;
  analyzed_at: string;
}
```

---

## 5. UI COMPONENTS

### shadcn/ui Components Used (48 total)

**Core Components**:
- Button, Card, Badge, Input, Textarea
- Table, Tabs, Select, Dropdown Menu
- Dialog, Drawer, Popover, Tooltip
- Sidebar, Sheet, ScrollArea
- Separator, Progress, Skeleton
- Avatar, Breadcrumb

**Form Components**:
- Form (react-hook-form integration)
- Label, Input, Input OTP, Checkbox
- Radio Group, Select, Toggle, Switch
- Calendar, Date Picker

**Data Display**:
- Table, Pagination, Accordion
- Carousel, Chart, Badge

**Accessibility**:
- Alert Dialog, Context Menu, Menubar
- Navigation Menu, Hover Card

---

## 6. SERVICES AND INTEGRATIONS

### TranscriptService (`/tmp/JusticeMAP/src/services/transcripts.ts`)

Class-based service with static methods:

```typescript
class TranscriptService {
  // Fetch all transcripts
  static async getAllTranscripts(): Promise<Transcript[]>
  
  // Fetch single transcript by ID
  static async getTranscriptById(id: string): Promise<Transcript | null>
  
  // Extract text from PDF files
  private static async extractTextFromPDF(file: File): Promise<string>
  
  // Upload new transcript
  static async uploadTranscript(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<{ success: boolean; transcriptId?: string; error?: string }>
  
  // Extract metadata from content
  private static extractMetadataFromContent(text: string): {
    hearingDate: string | null;
    inmateName: string | null;
    cdcrNumber: string | null;
  }
  
  // Filter by processed status
  static async getTranscriptsByStatus(processed: boolean): Promise<Transcript[]>
  
  // Get statistics
  static async getStatistics(): Promise<{
    total: number;
    processed: number;
    pending: number;
  }>
  
  // Delete transcript
  static async deleteTranscript(id: string): Promise<{ success: boolean; error?: string }>
}
```

**Features**:
- PDF text extraction using `pdfjs-dist`
- Metadata extraction via regex patterns:
  - Inmate name: "Hearing of: [NAME]"
  - CDCR number: "CDCR Number: [NUMBER]"
  - Hearing date: Month/Day/Year format
- Progress callback for uploads
- Error handling and validation

### Supabase Integration

**File**: `/tmp/JusticeMAP/src/lib/supabase.ts`

```typescript
const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

**Environment Variables Required**:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**Tables**:
- `transcripts` - Main transcript storage
- `predictions` - AI analysis predictions (innocence scores, claims)

---

## 7. STYLING AND BRANDING

### Color Scheme

**Light Mode**:
```css
--background: 0 0% 99%;           /* Very light gray */
--foreground: 0 0% 15%;           /* Dark gray */
--primary: 267 20% 50%;           /* Muted lavender */
--primary-foreground: 0 0% 100%; /* White */
--accent: 145 15% 50%;            /* Subtle sage green */
--success: 145 30% 45%;           /* Green */
--warning: 38 50% 50%;            /* Amber/orange */
--destructive: 0 60% 55%;         /* Red */
```

**Dark Mode**:
```css
--background: 30 10% 12%;         /* Warm dark (brownish) */
--foreground: 40 20% 95%;         /* Light cream */
--primary: 267 35% 70%;           /* Brighter lavender */
--accent: 145 30% 60%;            /* Brighter sage */
--success: 145 45% 55%;           /* Brighter green */
--warning: 38 80% 60%;            /* Brighter amber */
```

**Sidebar**:
- Light background with lavender accent
- Smooth transition between light/dark

### Typography
- Font stack: System fonts (configured in Tailwind)
- Border radius: 0.5rem
- Spacing: Tailwind default scale

### Brand Elements
- **Name**: JusticeMAP
- **Logo**: Scale/Balance icon (lucide-react)
- **Primary Icon Color**: Primary color (lavender)
- **Sidebar Branding**: Logo + "JusticeMAP" text (shown when expanded)

### Theme System
- Uses CSS custom properties (HSL colors)
- Dark mode class-based: `.dark`
- Configured in `/tmp/JusticeMAP/src/index.css`
- TailwindCSS with custom colors layer

---

## 8. STATE MANAGEMENT AND HOOKS

### useToast Hook
- Notification system using Sonner
- Action types: ADD_TOAST, UPDATE_TOAST, DISMISS_TOAST, REMOVE_TOAST
- Single toast at a time (TOAST_LIMIT = 1)

### React Query
- `QueryClientProvider` in App.tsx
- Used for data fetching and caching

### Custom Hooks
- `useToast()` - Toast notifications
- `useMobile()` - Mobile responsiveness detection

---

## 9. KEY FEATURES AND WORKFLOWS

### 1. Transcript Upload Workflow
1. User drags/drops or selects PDF/TXT files
2. File validation (type check)
3. Sequential upload with progress tracking
4. Text extraction (PDF.js for PDFs)
5. Metadata extraction (regex patterns)
6. Stored in Supabase `transcripts` table
7. Auto-redirect to transcripts list

### 2. Client Extraction
- Extracts inmate names from transcripts
- Searches for innocence claims using regex patterns:
  - "I did not/didn't do this/it"
  - "I am innocent"
  - "I maintain innocence"
  - "I was not there"
  - "pleaded/pled not guilty"

### 3. Case Analysis
- Displays transcript + analysis side-by-side
- Shows innocence score and indicators
- Panel composition and bias assessment
- Timeline of case events

### 4. Case Strength Calculation
- Scoring based on available metadata
- Factors: name, CDCR#, date, content length, innocence keywords
- Results: High (4+), Medium (2-3), Low (0-1)

---

## 10. CONFIGURATION FILES

### package.json
- **Name**: vite_react_shadcn_ts
- **Type**: Module (ES6)
- **Build Tool**: Vite 5.4.19
- **Framework**: React 18.3.1
- **Language**: TypeScript 5.8.3
- **Dependencies**: 40+ packages
  - UI: @radix-ui/*, shadcn/ui, lucide-react
  - Forms: react-hook-form, zod
  - Data: @tanstack/react-query, supabase
  - PDF: pdfjs-dist
  - Charts: recharts
  - Styling: tailwindcss, next-themes
  - Routing: react-router-dom
  - Notifications: sonner

### vite.config.ts
- React SWC plugin for faster builds
- Standard Vite configuration

### tsconfig.json
- Target: ES2020
- Module: ESNext
- Strict mode enabled
- Path alias: `@` → `./src`

### tailwind.config.ts
- Dark mode support (class-based)
- Custom theme colors (HSL)
- Sidebar color extensions
- Animation plugins

---

## 11. PLACEHOLDER/INCOMPLETE NAVIGATION ITEMS

**The following routes exist in sidebar but NO pages implemented**:

1. **Analyse** (`/analyze`) 
   - Icon: BarChart3
   - Status: Route defined, page missing
   
2. **Narratives** (`/narratives`)
   - Icon: BookText
   - Status: Route defined, page missing
   
3. **Policy Making Data** (`/policy-data`)
   - Icon: TrendingUp
   - Status: Route defined, page missing

These would likely serve as:
- **Analyse**: Advanced analytics/reporting dashboard
- **Narratives**: Case narrative builder/document generator
- **Policy Making Data**: Aggregated data for policy research

---

## 12. KEY FILE PATHS

```
/tmp/JusticeMAP/src/components/layout/AppSidebar.tsx        # Navigation
/tmp/JusticeMAP/src/components/layout/DashboardLayout.tsx   # Main layout
/tmp/JusticeMAP/src/pages/Clients.tsx                       # Client list
/tmp/JusticeMAP/src/pages/Cases.tsx                         # Case analysis
/tmp/JusticeMAP/src/pages/Transcripts.tsx                   # Transcript table
/tmp/JusticeMAP/src/pages/TranscriptDetail.tsx              # Transcript detail
/tmp/JusticeMAP/src/pages/Upload.tsx                        # Upload interface
/tmp/JusticeMAP/src/services/transcripts.ts                 # Service layer
/tmp/JusticeMAP/src/lib/types.ts                            # Type definitions
/tmp/JusticeMAP/src/lib/supabase.ts                         # DB client
/tmp/JusticeMAP/src/index.css                               # Theme/styles
/tmp/JusticeMAP/tailwind.config.ts                          # Tailwind config
/tmp/JusticeMAP/src/App.tsx                                 # Router setup
```

---

## 13. ENVIRONMENT SETUP

Required environment variables (`.env`):
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Summary

JusticeMAP is a well-structured React application focused on analyzing parole hearing transcripts to identify potential wrongful convictions. It features:

✓ Clean component-based architecture
✓ Type-safe development with TypeScript
✓ Responsive UI using shadcn/ui and Tailwind CSS
✓ PDF text extraction and metadata parsing
✓ Supabase backend integration
✓ Sophisticated case analysis and scoring
✓ Professional dark/light theme support
✓ 3 placeholder routes for future expansion

The application effectively balances functionality with extensibility, ready for additional features like advanced analytics, narrative building, and policy data aggregation.

# JusticeMAP - Code Snippets & Implementation Details

## Quick Reference: Key Code Examples

### 1. NAVIGATION SIDEBAR (AppSidebar.tsx)

```tsx
import { Home, Users, Briefcase, FileText, BarChart3, BookText, TrendingUp, Scale } from "lucide-react";
import { NavLink } from "@/components/NavLink";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Clients", url: "/clients", icon: Users },
  { title: "Cases", url: "/cases", icon: Briefcase },
  { title: "Transcripts", url: "/transcripts", icon: FileText },
  { title: "Analyse", url: "/analyze", icon: BarChart3 },        // PLACEHOLDER
  { title: "Narratives", url: "/narratives", icon: BookText },   // PLACEHOLDER
  { title: "Policy Making Data", url: "/policy-data", icon: TrendingUp }, // PLACEHOLDER
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  
  return (
    <Sidebar className={open ? "w-60" : "w-14"} collapsible="icon">
      <SidebarContent>
        <div className="flex items-center gap-2 px-4 py-4">
          <Scale className="h-6 w-6 text-primary" />
          {open && <span className="font-bold text-lg">JusticeMAP</span>}
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
```

---

### 2. METADATA EXTRACTION (TranscriptService)

```tsx
private static extractMetadataFromContent(text: string): {
  hearingDate: string | null;
  inmateName: string | null;
  cdcrNumber: string | null;
} {
  let inmateName: string | null = null;
  let cdcrNumber: string | null = null;
  let hearingDate: string | null = null;

  // Extract inmate name: "Hearing of: RAPHAEL BARRETO"
  const nameMatch = text.match(/Hearing\s+of:\s*([A-Z][A-Z\s]+?)(?:\n|CDCR)/i);
  if (nameMatch) {
    inmateName = nameMatch[1].trim();
  }

  // Extract CDCR: "CDCR Number: V96693"
  const cdcrMatch = text.match(/CDCR\s+Number:\s*([A-Z0-9]+)/i);
  if (cdcrMatch) {
    cdcrNumber = cdcrMatch[1].trim();
  }

  // Extract date: "FEBRUARY 7, 2025" or "FEBRUARY 7, 2025 8:36 AM"
  const dateMatch = text.match(/\b(JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)\s+(\d{1,2}),?\s+(\d{4})/i);
  if (dateMatch) {
    const monthMap: { [key: string]: string } = {
      'JANUARY': '01', 'FEBRUARY': '02', 'MARCH': '03', 'APRIL': '04',
      'MAY': '05', 'JUNE': '06', 'JULY': '07', 'AUGUST': '08',
      'SEPTEMBER': '09', 'OCTOBER': '10', 'NOVEMBER': '11', 'DECEMBER': '12'
    };
    const monthName = dateMatch[1];
    const month = monthMap[monthName.toUpperCase()];
    if (month) {
      hearingDate = `${dateMatch[3]}-${month}-${dateMatch[2].padStart(2, '0')}`;
    }
  }

  return { hearingDate, inmateName, cdcrNumber };
}
```

---

### 3. INNOCENCE CLAIM EXTRACTION (Clients.tsx)

```tsx
const extractInnocenceClaim = (rawText: string, inmateName: string | null): string => {
  if (!rawText) return "No transcript content available.";
  
  const innocencePatterns = [
    /I\s+(?:did\s+not|didn't)\s+do\s+(?:this|it)/i,
    /I\s+am\s+innocent/i,
    /I\s+maintain\s+(?:my\s+)?innocence/i,
    /I\s+was\s+not\s+there/i,
    /(?:pleaded|pled)\s+not\s+guilty/i,
  ];

  for (const pattern of innocencePatterns) {
    const match = rawText.match(pattern);
    if (match) {
      const matchIndex = rawText.indexOf(match[0]);
      const start = Math.max(0, matchIndex - 50);
      const end = Math.min(rawText.length, matchIndex + match[0].length + 100);
      let excerpt = rawText.substring(start, end).replace(/\s+/g, ' ').trim();
      if (start > 0) excerpt = '...' + excerpt;
      if (end < rawText.length) excerpt = excerpt + '...';
      return excerpt;
    }
  }

  return `${inmateName || 'Applicant'} parole hearing transcript available for review.`;
};
```

---

### 4. CASE STRENGTH CALCULATION (Clients.tsx)

```tsx
const calculateCaseStrength = (transcript: Transcript): "high" | "medium" | "low" => {
  let score = 0;
  
  if (transcript.inmate_name) score++;           // Has name
  if (transcript.cdcr_number) score++;           // Has CDCR number
  if (transcript.hearing_date) score++;          // Has date
  if (transcript.raw_text && transcript.raw_text.length > 1000) score++;  // Substantial content
  if (transcript.raw_text && /I\s+(?:did\s+not|didn't)\s+do|innocent|not\s+guilty/i.test(transcript.raw_text)) score++;  // Innocence keywords

  if (score >= 4) return "high";
  if (score >= 2) return "medium";
  return "low";
};
```

---

### 5. PDF TEXT EXTRACTION (TranscriptService)

```tsx
private static async extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = '';

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    fullText += pageText + '\n';
  }

  return fullText.trim();
}
```

---

### 6. THEME COLORS (index.css)

```css
@layer base {
  :root {
    /* Light Mode */
    --background: 0 0% 99%;           /* Nearly white */
    --foreground: 0 0% 15%;           /* Very dark gray */
    
    --primary: 267 20% 50%;           /* Muted lavender */
    --primary-foreground: 0 0% 100%; /* White on primary */
    
    --accent: 145 15% 50%;            /* Subtle sage green */
    --accent-foreground: 0 0% 100%; /* White on accent */
    
    --success: 145 30% 45%;           /* Green */
    --warning: 38 50% 50%;            /* Amber */
    --destructive: 0 60% 55%;         /* Red */
    
    --sidebar-background: 267 15% 98%;  /* Very light with hint of lavender */
    --sidebar-accent: 267 10% 94%;
  }

  .dark {
    /* Dark Mode */
    --background: 30 10% 12%;           /* Warm dark brown */
    --foreground: 40 20% 95%;           /* Light cream */
    
    --primary: 267 35% 70%;             /* Brighter lavender */
    --accent: 145 30% 60%;              /* Brighter sage */
    
    --success: 145 45% 55%;             /* Brighter green */
    --warning: 38 80% 60%;              /* Brighter amber */
    
    --sidebar-background: 30 10% 10%;
    --sidebar-accent: 30 10% 22%;
  }
}
```

---

### 7. ROUTER SETUP (App.tsx)

```tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Transcripts from "./pages/Transcripts";
import TranscriptDetail from "./pages/TranscriptDetail";
import Clients from "./pages/Clients";
import Cases from "./pages/Cases";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/cases" element={<Cases />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/transcripts" element={<Transcripts />} />
          <Route path="/transcript/:id" element={<TranscriptDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);
```

---

### 8. SUPABASE SETUP (supabase.ts)

```tsx
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

---

### 9. UPLOAD WITH PROGRESS (Upload.tsx)

```tsx
const uploadFiles = async (files: File[]) => {
  setIsUploading(true);
  const initialStatuses: FileUploadStatus[] = files.map(file => ({
    file,
    progress: 0,
    status: 'pending' as const,
  }));
  setUploadStatuses(initialStatuses);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    setUploadStatuses(prev =>
      prev.map((status, idx) =>
        idx === i ? { ...status, status: 'uploading' as const } : status
      )
    );

    try {
      const result = await TranscriptService.uploadTranscript(file, (progress) => {
        setUploadStatuses(prev =>
          prev.map((status, idx) =>
            idx === i ? { ...status, progress } : status
          )
        );
      });

      if (result.success) {
        setUploadStatuses(prev =>
          prev.map((status, idx) =>
            idx === i ? { ...status, status: 'success' as const, progress: 100 } : status
          )
        );
      } else {
        setUploadStatuses(prev =>
          prev.map((status, idx) =>
            idx === i ? { ...status, status: 'error' as const, error: result.error } : status
          )
        );
      }
    } catch (error) {
      setUploadStatuses(prev =>
        prev.map((status, idx) =>
          idx === i
            ? { ...status, status: 'error' as const, error: error instanceof Error ? error.message : 'Unknown error' }
            : status
        )
      );
    }
  }

  setIsUploading(false);
  // Show summary and navigate...
};
```

---

### 10. CASE STRENGTH BADGE (Clients.tsx)

```tsx
const getStrengthBadge = (strength: string) => {
  const colors = {
    high: "bg-slate-100 text-slate-700 border border-slate-200",
    medium: "bg-slate-50 text-slate-600 border border-slate-200",
    low: "bg-slate-50 text-slate-500 border border-slate-200",
  };
  return (
    <Badge variant="outline" className={colors[strength as keyof typeof colors]}>
      {strength.charAt(0).toUpperCase() + strength.slice(1)}
    </Badge>
  );
};
```

---

### 11. STATUS BADGE (Clients.tsx)

```tsx
const getStatusBadge = (status: string) => {
  const statusMap = {
    in_progress: { label: "In Progress", color: "bg-amber-50 text-amber-700 border border-amber-100" },
    new: { label: "New", color: "bg-purple-50 text-purple-700 border border-purple-100" },
    closed: { label: "Closed", color: "bg-slate-50 text-slate-500 border border-slate-200" },
  };
  const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.new;
  return (
    <Badge variant="outline" className={statusInfo.color}>
      {statusInfo.label}
    </Badge>
  );
};
```

---

### 12. TRANSACTION DETAIL - INNOCENCE ASSESSMENT (TranscriptDetail.tsx)

```tsx
{transcript.prediction && transcript.prediction.innocence_score !== null && (
  <Card className="border-border bg-card p-6">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Innocence Assessment</h2>
        <div className="flex items-center gap-4">
          <span className="text-4xl font-bold">
            {(transcript.prediction.innocence_score * 100).toFixed(0)}%
          </span>
          {getScoreBadge(transcript.prediction.innocence_score)}
        </div>
      </div>
    </div>

    <Separator className="my-6" />

    {/* Explicit Claims */}
    {transcript.prediction.explicit_claims && transcript.prediction.explicit_claims.length > 0 && (
      <div className="space-y-4 mb-6">
        <h3 className="text-lg font-semibold">Explicit Claims</h3>
        {transcript.prediction.explicit_claims.map((claim: any, idx: number) => (
          <Card key={idx} className="border-accent/30 bg-accent/5 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm mb-2">{claim.text || JSON.stringify(claim)}</p>
              </div>
              {claim.confidence && (
                <Badge variant="outline">
                  {(claim.confidence * 100).toFixed(0)}% confidence
                </Badge>
              )}
            </div>
          </Card>
        ))}
      </div>
    )}

    {/* Implicit Signals */}
    {transcript.prediction.implicit_signals && transcript.prediction.implicit_signals.length > 0 && (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Implicit Signals</h3>
        {transcript.prediction.implicit_signals.map((signal: any, idx: number) => (
          <Card key={idx} className="border-border bg-card/50 p-4">
            <p className="text-sm">{signal.text || JSON.stringify(signal)}</p>
          </Card>
        ))}
      </div>
    )}
  </Card>
)}
```

---

### 13. CASE ANALYSIS - SPLIT PANEL (Cases.tsx)

```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100vh-200px)]">
  {/* Left Panel - Transcript */}
  <Card className="p-6 flex flex-col">
    <h2 className="text-lg font-semibold mb-4">Transcript</h2>
    <ScrollArea className="flex-1 pr-4">
      <div className="space-y-4 text-sm">
        {/* Transcript content */}
      </div>
    </ScrollArea>
    
    <div className="mt-4 pt-4 border-t">
      <h3 className="font-semibold mb-3">Identified Tags</h3>
      <div className="flex flex-wrap gap-2">
        {/* Tags */}
      </div>
    </div>
  </Card>

  {/* Right Panel - Case Details */}
  <Card className="p-6 flex flex-col">
    <h2 className="text-lg font-semibold mb-4">Case Details</h2>
    <Tabs defaultValue="overview" className="flex-1 flex flex-col">
      <TabsList className="w-full grid grid-cols-3">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="panel">Panel Analysis</TabsTrigger>
        <TabsTrigger value="timeline">Timeline</TabsTrigger>
      </TabsList>
      {/* Tab content */}
    </Tabs>
  </Card>
</div>
```

---

## Environment Variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

---

## Key Regex Patterns

| Pattern | Purpose | Example |
|---------|---------|---------|
| `Hearing\s+of:\s*([A-Z][A-Z\s]+?)(?:\n\|CDCR)` | Extract inmate name | "Hearing of: RAPHAEL BARRETO" |
| `CDCR\s+Number:\s*([A-Z0-9]+)` | Extract CDCR number | "CDCR Number: V96693" |
| `(JANUARY\|FEBRUARY\|...\|DECEMBER)\s+(\d{1,2}),?\s+(\d{4})` | Extract hearing date | "FEBRUARY 7, 2025" |
| `I\s+(?:did\s+not\|didn't)\s+do\s+(?:this\|it)` | Innocence claim 1 | "I did not do this" |
| `I\s+am\s+innocent` | Innocence claim 2 | "I am innocent" |
| `I\s+maintain\s+(?:my\s+)?innocence` | Innocence claim 3 | "I maintain innocence" |
| `I\s+was\s+not\s+there` | Innocence claim 4 | "I was not there" |
| `(?:pleaded\|pled)\s+not\s+guilty` | Innocence claim 5 | "pleaded not guilty" |

---


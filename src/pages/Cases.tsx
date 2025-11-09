import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { TranscriptService } from "@/services/transcripts";
import { Transcript } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Commissioner background database (based on your research)
const COMMISSIONER_BACKGROUNDS: Record<string, { category: string; details: string }> = {
  "MICHAEL RUFF": {
    category: "Corrections & Law Enforcement",
    details: "Former warden at San Quentin (12.5 years) and DVI (5 years). Career correctional officer background.",
  },
  "PATRICIA CASSADY": {
    category: "Parole Board Administration",
    details: "Long-term BPH experience since 1995. Deputy Commissioner, Chief Deputy Commissioner.",
  },
  "KEVIN CHAPPELL": {
    category: "Corrections & Law Enforcement",
    details: "Warden at San Quentin, Chief Deputy Warden at Folsom. 30+ years corrections.",
  },
  "DIANNE DOBBS": {
    category: "Legal, Judicial & Mixed Legal",
    details: "Attorney for Sacramento Child Advocates Inc. Senior Staff Counsel at Department of Consumer Affairs.",
  },
  "JULIE GARLAND": {
    category: "Prosecution & State's Attorney",
    details: "Senior Assistant Attorney General. 20+ years at AG office.",
  },
  "GILBERT INFANTE": {
    category: "Corrections & Law Enforcement",
    details: "Commissioner for Board of Juvenile Hearings. Treatment Team Supervisor, Youth Correctional Counselor.",
  },
  "TEAL KOZEL": {
    category: "Mental Health",
    details: "Senior Psychologist Supervisor, Doctor of Psychology in Clinical Psychology.",
  },
  "DAVID LONG": {
    category: "Corrections & Law Enforcement",
    details: "Warden at California City and Ironwood. VP of Prison Engagement at Defy Ventures.",
  },
  "MICHELE MINOR": {
    category: "Corrections & Law Enforcement",
    details: "Deputy Director of Rehabilitative Programs. 30+ years in corrections.",
  },
  "WILLIAM MUNIZ": {
    category: "Corrections & Law Enforcement",
    details: "Warden at Salinas Valley State Prison. Chief Deputy Administrator.",
  },
  "DAVID NDUDIM": {
    category: "Legal, Judicial & Mixed Legal",
    details: "Temporary Superior Court Judge. Attorney in private practice.",
  },
  "KATHLEEN O'MEARA": {
    category: "Mental Health",
    details: "Regional Mental Health Administrator. Clinical and Forensic Psychologist.",
  },
  "CATHERINE PURCELL": {
    category: "Prosecution & State's Attorney",
    details: "Deputy District Attorney in Kern County. Former Superior Court Judge.",
  },
  "NEIL SCHNEIDER": {
    category: "Corrections & Law Enforcement",
    details: "Police Captain at Sacramento Police Department. 34 years law enforcement.",
  },
  "EXCEL SHARRIEFF": {
    category: "Legal, Judicial & Mixed Legal",
    details: "Attorney in private practice. Judge Pro Tem.",
  },
  "EMILY SHEFFIELD": {
    category: "Legal, Judicial & Mixed Legal",
    details: "Senior Appellate Attorney. Volunteer for the Exoneration Project.",
  },
  "TROY TAIRA": {
    category: "Legal, Judicial & Mixed Legal",
    details: "Defense Attorney in Fresno County Public Defender's Office. Multiple ALJ roles.",
  },
  "MARY THORNTON": {
    category: "Prosecution & State's Attorney",
    details: "Deputy District Attorney in Madera and Kings Counties.",
  },
  "JACK WEISS": {
    category: "Prosecution & State's Attorney",
    details: "Assistant U.S. Attorney. LA City Council chair of Public Safety Committee.",
  },
  "NEAL CHAMBERS": {
    category: "Unknown Background",
    details: "Deputy Commissioner. Background information pending research.",
  },
};

const Cases = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commissioners, setCommissioners] = useState<string[]>([]);

  // Extract commissioner names from transcript text
  const extractCommissioners = useCallback((text: string): string[] => {
    const names = new Set<string>();
    
    // Pattern 1: "EMILY SHEFFIELD, Presiding Commissioner" (at start of transcript)
    const panelPattern1 = /^([A-Z]+(?:\s+[A-Z]+)+),\s+(?:Presiding|Deputy)\s+Commissioner/gim;
    
    // Pattern 2: "PRESIDING COMMISSIONER SHEFFIELD" (in dialogue)
    const panelPattern2 = /(?:PRESIDING|DEPUTY)\s+COMMISSIONER\s+([A-Z]+(?:\s+[A-Z]+)?)[:\s]/gi;
    
    // Pattern 3: Look specifically in "PANEL PRESENT:" section
    const panelSectionMatch = text.match(/PANEL PRESENT:?\s*([\s\S]*?)(?:OTHERS PRESENT|$)/i);
    if (panelSectionMatch) {
      const panelSection = panelSectionMatch[1];
      
      // Extract names before "Commissioner" in panel section
      const sectionMatches = panelSection.matchAll(/([A-Z]+(?:\s+[A-Z]+)+),?\s+(?:Presiding|Deputy)\s+Commissioner/gi);
      for (const match of sectionMatches) {
        const name = match[1].trim().toUpperCase();
        // Only add if it's a reasonable name length (2-4 words)
        const wordCount = name.split(/\s+/).length;
        if (wordCount >= 2 && wordCount <= 4) {
          names.add(name);
        }
      }
    }
    
    // Fallback: Extract from dialogue headers (only if we found no names in panel section)
    if (names.size === 0) {
      const dialogueMatches = text.matchAll(panelPattern2);
      for (const match of dialogueMatches) {
        const name = match[1].trim().toUpperCase();
        names.add(name);
      }
    }
    
    return Array.from(names);
  }, []);

  useEffect(() => {
    const loadTranscript = async () => {
      if (!id) {
        navigate("/clients");
        return;
      }

      try {
        setIsLoading(true);
        const data = await TranscriptService.getTranscriptById(id);
        if (!data) {
          toast({
            title: "Transcript not found",
            description: "The requested transcript could not be found.",
            variant: "destructive",
          });
          navigate("/clients");
          return;
        }
        setTranscript(data);
        
        // Extract commissioner names from transcript
        const extractedCommissioners = extractCommissioners(data.raw_text);
        setCommissioners(extractedCommissioners);
      } catch (error) {
        toast({
          title: "Error loading transcript",
          description: error instanceof Error ? error.message : "An error occurred",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadTranscript();
  }, [id, navigate, toast, extractCommissioners]);

  // Parse transcript into dialogue chunks
  const parseTranscript = (text: string) => {
    if (!text) return [];
    
    // Split by speaker patterns
    const speakerPattern = /([A-Z\s]+(?:COMMISSIONER|ATTORNEY|INMATE)?[A-Z\s]*?):\s*/g;
    const parts = text.split(speakerPattern).filter(Boolean);
    
    const dialogues: { speaker: string; text: string }[] = [];
    for (let i = 0; i < parts.length; i += 2) {
      if (i + 1 < parts.length) {
        dialogues.push({
          speaker: parts[i].trim(),
          text: parts[i + 1].trim(),
        });
      }
    }
    
    return dialogues.slice(0, 20); // Limit to first 20 exchanges for UI
  };

  // Check if text contains innocence indicators
  const hasInnocenceIndicator = (text: string): boolean => {
    const patterns = [
      /maintain.*different/i,
      /circumstances.*different/i,
      /didn't.*do/i,
      /did not.*commit/i,
      /innocent/i,
      /wrongly/i,
      /falsely/i,
    ];
    return patterns.some((pattern) => pattern.test(text));
  };

  // Get panel composition analysis
  const getPanelAnalysis = () => {
    const categorized = commissioners.map((name) => ({
      name,
      background: COMMISSIONER_BACKGROUNDS[name] || {
        category: "Unknown Background",
        details: "Background information pending research.",
      },
    }));

    const lawEnforcementCount = categorized.filter(
      (c) => c.background.category === "Corrections & Law Enforcement"
    ).length;
    const prosecutionCount = categorized.filter(
      (c) => c.background.category === "Prosecution & State's Attorney"
    ).length;
    const total = categorized.length;

    const biasRisk =
      lawEnforcementCount + prosecutionCount === total && total > 0
        ? "high"
        : lawEnforcementCount + prosecutionCount >= total / 2
        ? "medium"
        : "low";

    return { categorized, biasRisk, lawEnforcementCount, prosecutionCount, total };
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Loading case analysis...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!transcript) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Transcript not found.</p>
          <Button onClick={() => navigate("/clients")} className="mt-4">
            Back to Clients
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const dialogues = parseTranscript(transcript.raw_text);
  const panelAnalysis = getPanelAnalysis();

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header Table */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">Case Analysis</h1>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span>Transcript ID: {transcript.id.slice(0, 8)}</span>
              <span>Client: {transcript.inmate_name || "Unknown"}</span>
              <span>CDCR: {transcript.cdcr_number || "N/A"}</span>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate("/clients")}>
            Back to Clients
          </Button>
        </div>

        {/* Split Panel Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100vh-200px)]">
          {/* Left Panel - Transcript */}
          <Card className="p-6 flex flex-col">
            <h2 className="text-lg font-semibold mb-4">Transcript Excerpt</h2>
            
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4 text-sm">
                {dialogues.length > 0 ? (
                  dialogues.map((dialogue, idx) => (
                    <div key={idx} className="space-y-2">
                      <p className="font-medium">{dialogue.speaker}:</p>
                      <p
                        className={`text-muted-foreground ${
                          hasInnocenceIndicator(dialogue.text)
                            ? "bg-purple-50 p-3 rounded border-l-4 border-purple-300"
                            : ""
                        }`}
                      >
                        {dialogue.text.length > 500
                          ? dialogue.text.substring(0, 500) + "..."
                          : dialogue.text}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No structured dialogue detected. Raw transcript available below.
                  </p>
                )}
              </div>
            </ScrollArea>

            <div className="mt-4 pt-4 border-t">
              <h3 className="font-semibold mb-3">Auto-Detected Indicators</h3>
              <div className="flex flex-wrap gap-2">
                {commissioners.length > 0 && (
                  <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                    {commissioners.length} Commissioner{commissioners.length !== 1 ? "s" : ""} Detected
                  </Badge>
                )}
                {hasInnocenceIndicator(transcript.raw_text) && (
                  <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-100">
                    Innocence Language Detected
                  </Badge>
                )}
                {transcript.hearing_date && (
                  <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                    Hearing Date: {new Date(transcript.hearing_date).toLocaleDateString()}
                  </Badge>
                )}
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

              <TabsContent value="overview" className="flex-1 mt-4">
                <ScrollArea className="h-full pr-4">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-2">Case Summary</h3>
                      <dl className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <dt className="text-muted-foreground">Applicant</dt>
                          <dd className="font-medium">{transcript.inmate_name || "Unknown"}</dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">CDCR Number</dt>
                          <dd className="font-medium">{transcript.cdcr_number || "N/A"}</dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">File Name</dt>
                          <dd className="font-medium text-xs">{transcript.file_name}</dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">Hearing Date</dt>
                          <dd className="font-medium">
                            {transcript.hearing_date
                              ? new Date(transcript.hearing_date).toLocaleDateString()
                              : "Unknown"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">Upload Date</dt>
                          <dd className="font-medium">
                            {new Date(transcript.uploaded_at).toLocaleDateString()}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">Processing Status</dt>
                          <dd>
                            <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
                              {transcript.processed ? "Processed" : "Pending Review"}
                            </Badge>
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Detected Indicators</h3>
                      <ul className="space-y-2 text-sm">
                        {hasInnocenceIndicator(transcript.raw_text) && (
                          <li className="flex items-start gap-2">
                            <span className="text-purple-500">⚠️</span>
                            <span>Innocence-related language detected in transcript</span>
                          </li>
                        )}
                        {commissioners.length > 0 && (
                          <li className="flex items-start gap-2">
                            <span className="text-slate-500">✓</span>
                            <span>
                              {commissioners.length} commissioner{commissioners.length !== 1 ? "s" : ""}{" "}
                              identified: {commissioners.join(", ")}
                            </span>
                          </li>
                        )}
                        {transcript.raw_text.toLowerCase().includes("attorney") && (
                          <li className="flex items-start gap-2">
                            <span className="text-slate-500">✓</span>
                            <span>Legal representation present</span>
                          </li>
                        )}
                        {!hasInnocenceIndicator(transcript.raw_text) && (
                          <li className="flex items-start gap-2">
                            <span className="text-slate-400">ℹ️</span>
                            <span className="text-muted-foreground">
                              No explicit innocence claims detected
                            </span>
                          </li>
                        )}
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Recommended Actions</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Review full transcript for context</li>
                        <li>• Cross-reference commissioner backgrounds</li>
                        {hasInnocenceIndicator(transcript.raw_text) && (
                          <li>• Flag for innocence project review</li>
                        )}
                        <li>• Document panel composition for bias analysis</li>
                      </ul>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="panel" className="flex-1 mt-4">
                <ScrollArea className="h-full pr-4">
                  <div className="space-y-6">
                    {panelAnalysis.categorized.length > 0 ? (
                      <>
                        <div>
                          <h3 className="font-semibold mb-3">Panel Composition</h3>
                          <div className="space-y-3">
                            {panelAnalysis.categorized.map((commissioner, idx) => (
                              <div key={idx} className="p-4 border rounded-lg">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <p className="font-medium">Commissioner {commissioner.name}</p>
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className={
                                      commissioner.background.category === "Corrections & Law Enforcement" ||
                                      commissioner.background.category === "Prosecution & State's Attorney"
                                        ? "bg-rose-50 text-rose-700 border-rose-200"
                                        : commissioner.background.category === "Mental Health"
                                        ? "bg-purple-50 text-purple-700 border-purple-200"
                                        : "bg-slate-50 text-slate-600 border-slate-200"
                                    }
                                  >
                                    {commissioner.background.category}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {commissioner.background.details}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold mb-2">Bias Risk Assessment</h3>
                          <div
                            className={`p-4 border rounded-lg ${
                              panelAnalysis.biasRisk === "high"
                                ? "bg-rose-50 border-rose-100"
                                : panelAnalysis.biasRisk === "medium"
                                ? "bg-amber-50 border-amber-100"
                                : "bg-slate-50 border-slate-100"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <Badge
                                variant="outline"
                                className={
                                  panelAnalysis.biasRisk === "high"
                                    ? "bg-rose-100 text-rose-700 border-rose-200"
                                    : panelAnalysis.biasRisk === "medium"
                                    ? "bg-amber-100 text-amber-700 border-amber-200"
                                    : "bg-slate-100 text-slate-700 border-slate-200"
                                }
                              >
                                {panelAnalysis.biasRisk.charAt(0).toUpperCase() +
                                  panelAnalysis.biasRisk.slice(1)}{" "}
                                Risk
                              </Badge>
                              <span className="text-sm font-medium">
                                {panelAnalysis.lawEnforcementCount + panelAnalysis.prosecutionCount} of{" "}
                                {panelAnalysis.total} from Law Enforcement/Prosecution
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {panelAnalysis.biasRisk === "high"
                                ? "This panel composition has historically shown higher denial rates for innocence claims, often interpreting maintained innocence as 'lack of remorse' or 'minimization.'"
                                : panelAnalysis.biasRisk === "medium"
                                ? "This mixed panel may have varied perspectives, but law enforcement/prosecution backgrounds still dominate."
                                : "This panel composition includes diverse backgrounds that may be more receptive to innocence claims."}
                            </p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">
                          No commissioners detected in transcript. Analysis unavailable.
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="timeline" className="flex-1 mt-4">
                <ScrollArea className="h-full pr-4">
                  <div className="space-y-4">
                    {transcript.hearing_date && (
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full bg-primary" />
                          <div className="w-0.5 h-full bg-border" />
                        </div>
                        <div className="pb-8">
                          <p className="font-medium">
                            {new Date(transcript.hearing_date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-muted-foreground">Parole Hearing</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Transcript uploaded to database for analysis
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-border" />
                        <div className="w-0.5 h-full bg-border" />
                      </div>
                      <div className="pb-8">
                        <p className="font-medium">
                          {new Date(transcript.uploaded_at).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">Transcript Uploaded</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          File: {transcript.file_name}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-border" />
                      </div>
                      <div>
                        <p className="font-medium">Status</p>
                        <p className="text-sm text-muted-foreground">
                          {transcript.processed ? "Processed and reviewed" : "Pending full review"}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {commissioners.length > 0
                            ? `${commissioners.length} commissioner(s) identified`
                            : "Commissioner extraction pending"}
                        </p>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>

            <div className="flex gap-3 mt-6 pt-4 border-t">
              <Button className="flex-1" variant="default" onClick={() => navigate(`/transcript/${transcript.id}`)}>
                View Full Transcript
              </Button>
              <Button className="flex-1" variant="outline" onClick={() => navigate("/clients")}>
                Back to Clients
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Cases;


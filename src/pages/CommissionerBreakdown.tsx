import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { TranscriptService } from "@/services/transcripts";
import { CommissionerService } from "@/services/commissioners";
import { Transcript, Commissioner, CommissionerWithStats } from "@/lib/types";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useVolunteer } from "@/context/VolunteerContext";
import { useNavigate } from "react-router-dom";
import { 
  Scale,
  AlertTriangle,
  TrendingUp,
  Search,
  FileText,
  ChevronRight,
  BarChart3
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Commissioner background database
const COMMISSIONER_BACKGROUNDS: Record<string, { category: string; details: string }> = {
  "ROBERT BARTON": { category: "Corrections & Law Enforcement", details: "Law enforcement background." },
  "MICHAEL RUFF": { category: "Corrections & Law Enforcement", details: "Former warden at San Quentin (12.5 years) and DVI (5 years)." },
  "KEVIN CHAPPELL": { category: "Corrections & Law Enforcement", details: "Warden at San Quentin, Chief Deputy Warden at Folsom." },
  "GILBERT INFANTE": { category: "Corrections & Law Enforcement", details: "Commissioner for Board of Juvenile Hearings. Youth Correctional Counselor." },
  "DAVID LONG": { category: "Corrections & Law Enforcement", details: "Warden at California City and Ironwood." },
  "MICHELE MINOR": { category: "Corrections & Law Enforcement", details: "Deputy Director of Rehabilitative Programs." },
  "WILLIAM MUNIZ": { category: "Corrections & Law Enforcement", details: "Warden at Salinas Valley State Prison." },
  "NEIL SCHNEIDER": { category: "Corrections & Law Enforcement", details: "Captain at Sacramento Police Department." },
  "JULIE GARLAND": { category: "Prosecution & State's Attorney", details: "Senior Assistant Attorney General." },
  "CATHERINE PURCELL": { category: "Prosecution & State's Attorney", details: "Deputy District Attorney, Judge at Kern County Superior Court." },
  "MARY THORNTON": { category: "Prosecution & State's Attorney", details: "Senior Deputy District Attorney." },
  "JACK WEISS": { category: "Prosecution & State's Attorney", details: "Assistant U.S. Attorney." },
  "TEAL KOZEL": { category: "Mental Health", details: "Senior Psychologist Supervisor, Doctor of Psychology." },
  "KATHLEEN O'MEARA": { category: "Mental Health", details: "Regional Mental Health Administrator." },
  "DIANNE DOBBS": { category: "Legal, Judicial & Mixed Legal", details: "Attorney for Sacramento Child Advocates Inc." },
  "DAVID NDUDIM": { category: "Legal, Judicial & Mixed Legal", details: "ALJ, Temporary Superior Court Judge." },
  "ROSALIND SARGENT-BURNS": { category: "Legal, Judicial & Mixed Legal", details: "Senior Deputy Pardon Attorney at U.S. Dept. of Justice." },
  "EXCEL SHARRIEFF": { category: "Legal, Judicial & Mixed Legal", details: "ALJ, Judge Pro Tem." },
  "EMILY SHEFFIELD": { category: "Legal, Judicial & Mixed Legal", details: "Appellate Attorney, Volunteer for the Exoneration Project." },
  "TROY TAIRA": { category: "Legal, Judicial & Mixed Legal", details: "ALJ, Defense Attorney - Public Defender's Office." },
  "PATRICIA CASSADY": { category: "Parole Board Administration", details: "Long-term BPH experience since 1995." },
  "PHONG NGUYEN": { category: "Legal, Judicial & Mixed Legal", details: "Administrative Law Judge." },
};

interface CommissionerAnalysis {
  name: string;
  category: string;
  details: string;
  hearingsCount: number;
  innocenceClaimHearings: number;
  biasLanguageCount: number;
  transcripts: Transcript[];
  biasPatterns: { phrase: string; count: number }[];
  caseTypes: { type: string; count: number }[];
}

const CommissionerBreakdown = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated } = useVolunteer();
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [commissionerAnalyses, setCommissionerAnalyses] = useState<CommissionerAnalysis[]>([]);
  const [selectedCommissioner, setSelectedCommissioner] = useState<CommissionerAnalysis | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      loadCommissionerData();
    }
  }, [isAuthenticated]);

  const loadCommissionerData = async () => {
    try {
      setIsLoading(true);
      const data = await TranscriptService.getAllTranscripts();
      setTranscripts(data);

      // Analyze commissioner data
      const commissionerMap = new Map<string, CommissionerAnalysis>();

      data.forEach((transcript) => {
        const commissioners = extractCommissioners(transcript.raw_text);
        const hasInnocenceClaim = checkInnocenceClaim(transcript.raw_text);
        const biasLanguage = analyzeBiasLanguage(transcript.raw_text);

        commissioners.forEach((commissionerName) => {
          const background = COMMISSIONER_BACKGROUNDS[commissionerName];
          const category = background?.category || "Unknown Background";
          const details = background?.details || "Background information pending research.";

          if (!commissionerMap.has(commissionerName)) {
            commissionerMap.set(commissionerName, {
              name: commissionerName,
              category,
              details,
              hearingsCount: 0,
              innocenceClaimHearings: 0,
              biasLanguageCount: 0,
              transcripts: [],
              biasPatterns: [],
              caseTypes: [],
            });
          }

          const analysis = commissionerMap.get(commissionerName)!;
          analysis.hearingsCount++;
          analysis.transcripts.push(transcript);
          if (hasInnocenceClaim) analysis.innocenceClaimHearings++;
          analysis.biasLanguageCount += biasLanguage.totalCount;
          
          // Track bias patterns
          biasLanguage.patterns.forEach(pattern => {
            const existingPattern = analysis.biasPatterns.find(p => p.phrase === pattern.phrase);
            if (existingPattern) {
              existingPattern.count += pattern.count;
            } else {
              analysis.biasPatterns.push({ ...pattern });
            }
          });

          // Track case types (simplified classification)
          const caseType = classifyCaseType(transcript);
          const existingType = analysis.caseTypes.find(t => t.type === caseType);
          if (existingType) {
            existingType.count++;
          } else {
            analysis.caseTypes.push({ type: caseType, count: 1 });
          }
        });
      });

      setCommissionerAnalyses(
        Array.from(commissionerMap.values())
          .sort((a, b) => b.hearingsCount - a.hearingsCount)
      );
    } catch (error) {
      toast({
        title: "Error loading commissioner data",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const extractCommissioners = (text: string): string[] => {
    const names = new Set<string>();
    const panelSectionMatch = text.match(/PANEL PRESENT:?\s*([\s\S]*?)(?:OTHERS PRESENT|$)/i);
    
    if (panelSectionMatch) {
      const panelSection = panelSectionMatch[1];
      const sectionMatches = panelSection.matchAll(/([A-Z]+(?:\s+[A-Z]+)+),?\s+(?:Presiding|Deputy)?\s*Commissioner/gi);
      
      for (const match of sectionMatches) {
        const name = match[1].trim().toUpperCase();
        const wordCount = name.split(/\s+/).length;
        if (wordCount >= 2 && wordCount <= 4) {
          names.add(name);
        }
      }
    }
    
    return Array.from(names);
  };

  const checkInnocenceClaim = (text: string): boolean => {
    const patterns = [
      /maintain.*different/i,
      /didn't.*do/i,
      /innocent/i,
      /wrongly/i,
      /falsely/i,
      /I\s+(?:did\s+not|didn't)\s+do/i,
    ];
    return patterns.some((pattern) => pattern.test(text));
  };

  const analyzeBiasLanguage = (text: string): { totalCount: number; patterns: { phrase: string; count: number }[] } => {
    const biasPatterns = [
      { phrase: "lack of insight", regex: /lack of insight/gi },
      { phrase: "minimizing", regex: /minimiz/gi },
      { phrase: "denial", regex: /in denial|denial of/gi },
      { phrase: "not taking responsibility", regex: /not taking responsibility/gi },
      { phrase: "lack of remorse", regex: /lack of remorse/gi },
    ];
    
    let totalCount = 0;
    const patterns: { phrase: string; count: number }[] = [];
    
    biasPatterns.forEach(({ phrase, regex }) => {
      const matches = text.match(regex);
      const count = matches ? matches.length : 0;
      if (count > 0) {
        patterns.push({ phrase, count });
        totalCount += count;
      }
    });
    
    return { totalCount, patterns };
  };

  const classifyCaseType = (transcript: Transcript): string => {
    const text = transcript.raw_text.toLowerCase();
    
    if (text.includes("murder") || text.includes("homicide")) return "Murder/Homicide";
    if (text.includes("robbery") || text.includes("burglary")) return "Robbery/Burglary";
    if (text.includes("assault") || text.includes("battery")) return "Assault/Battery";
    if (text.includes("drug") || text.includes("narcotics")) return "Drug-Related";
    if (text.includes("domestic violence")) return "Domestic Violence";
    
    return "Other";
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      "Corrections & Law Enforcement": "bg-rose-50 text-rose-700 border-rose-200",
      "Prosecution & State's Attorney": "bg-rose-50 text-rose-700 border-rose-200",
      "Mental Health": "bg-purple-50 text-purple-700 border-purple-200",
      "Legal, Judicial & Mixed Legal": "bg-slate-50 text-slate-700 border-slate-200",
      "Parole Board Administration": "bg-slate-50 text-slate-700 border-slate-200",
      "Unknown Background": "bg-amber-50 text-amber-700 border-amber-200",
    };
    return colors[category] || "bg-slate-50 text-slate-700 border-slate-200";
  };

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const filteredCommissioners = commissionerAnalyses.filter((commissioner) => {
    if (!searchTerm) return true;
    return commissioner.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalHearings = transcripts.length;
  const totalInnocenceClaims = commissionerAnalyses.reduce((sum, c) => sum + c.innocenceClaimHearings, 0);
  const totalBiasInstances = commissionerAnalyses.reduce((sum, c) => sum + c.biasLanguageCount, 0);
  const lePercentage = ((commissionerAnalyses
    .filter(c => c.category === "Corrections & Law Enforcement" || c.category === "Prosecution & State's Attorney")
    .reduce((sum, c) => sum + c.hearingsCount, 0) / totalHearings) * 100).toFixed(0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-sm">
            Commissioner Breakdown Analysis
          </h1>
          <p className="text-slate-200 mt-2 font-medium">
            Individual commissioner profiles, case patterns, and bias indicators
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-slate-200 font-medium">
            Loading commissioner data...
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-foreground">{totalHearings}</p>
                <p className="text-sm font-semibold text-foreground mt-1">Total Hearings</p>
                <p className="text-xs text-muted-foreground mt-2">Transcripts analyzed</p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-full bg-rose-50 flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-rose-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-foreground">{lePercentage}%</p>
                <p className="text-sm font-semibold text-foreground mt-1">LE/Prosecution Panels</p>
                <p className="text-xs text-muted-foreground mt-2">Law enforcement backgrounds</p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-full bg-purple-50 flex items-center justify-center">
                    <Scale className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-foreground">{totalInnocenceClaims}</p>
                <p className="text-sm font-semibold text-foreground mt-1">Innocence Claims</p>
                <p className="text-xs text-muted-foreground mt-2">Detected across hearings</p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-foreground">{totalBiasInstances}</p>
                <p className="text-sm font-semibold text-foreground mt-1">Bias Phrases</p>
                <p className="text-xs text-muted-foreground mt-2">"Lack of insight", etc.</p>
              </Card>
            </div>

            {/* Search Bar */}
            <Card className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search commissioners by name..."
                  className="pl-10 text-foreground"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </Card>

            {/* Commissioner Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCommissioners.map((commissioner) => (
                <Card
                  key={commissioner.name}
                  className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedCommissioner(commissioner)}
                >
                  <div className="space-y-4">
                    {/* Header with Avatar */}
                    <div className="flex items-start gap-3">
                      <Avatar className="h-14 w-14">
                        <AvatarFallback className="bg-primary/20 text-primary font-bold">
                          {getInitials(commissioner.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-foreground text-base">
                          {commissioner.name}
                        </h3>
                        <Badge variant="outline" className={`mt-1 ${getCategoryColor(commissioner.category)}`}>
                          {commissioner.category}
                        </Badge>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-3 gap-3 pt-3 border-t">
                      <div>
                        <p className="text-2xl font-bold text-foreground">{commissioner.hearingsCount}</p>
                        <p className="text-xs text-muted-foreground">Hearings</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-purple-600">{commissioner.innocenceClaimHearings}</p>
                        <p className="text-xs text-muted-foreground">Innocence</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-rose-600">{commissioner.biasLanguageCount}</p>
                        <p className="text-xs text-muted-foreground">Bias</p>
                      </div>
                    </div>

                    {/* Warning if high bias */}
                    {commissioner.biasLanguageCount > 20 && (
                      <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-2 rounded">
                        <AlertTriangle className="h-3 w-3" />
                        High bias language detected
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Commissioner Detail Modal */}
        <Dialog open={!!selectedCommissioner} onOpenChange={() => setSelectedCommissioner(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedCommissioner && (
              <>
                <DialogHeader>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-primary/20 text-primary font-bold text-xl">
                        {getInitials(selectedCommissioner.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <DialogTitle className="text-2xl">{selectedCommissioner.name}</DialogTitle>
                      <Badge variant="outline" className={`mt-2 ${getCategoryColor(selectedCommissioner.category)}`}>
                        {selectedCommissioner.category}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-2">{selectedCommissioner.details}</p>
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  {/* Summary Statistics */}
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="p-4">
                      <p className="text-3xl font-bold text-primary">{selectedCommissioner.hearingsCount}</p>
                      <p className="text-sm text-muted-foreground">Total Hearings</p>
                    </Card>
                    <Card className="p-4">
                      <p className="text-3xl font-bold text-purple-600">{selectedCommissioner.innocenceClaimHearings}</p>
                      <p className="text-sm text-muted-foreground">Innocence Claims</p>
                    </Card>
                    <Card className="p-4">
                      <p className="text-3xl font-bold text-rose-600">{selectedCommissioner.biasLanguageCount}</p>
                      <p className="text-sm text-muted-foreground">Bias Instances</p>
                    </Card>
                  </div>

                  {/* Bias Patterns */}
                  {selectedCommissioner.biasPatterns.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Bias Language Patterns</h3>
                      <div className="space-y-2">
                        {selectedCommissioner.biasPatterns
                          .sort((a, b) => b.count - a.count)
                          .map((pattern, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-rose-50 rounded-lg border border-rose-100">
                              <span className="text-sm font-medium text-rose-900">"{pattern.phrase}"</span>
                              <Badge variant="outline" className="bg-rose-100 text-rose-700">
                                {pattern.count} times
                              </Badge>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Case Types Breakdown */}
                  {selectedCommissioner.caseTypes.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Case Types Judged</h3>
                      <div className="space-y-2">
                        {selectedCommissioner.caseTypes
                          .sort((a, b) => b.count - a.count)
                          .map((caseType, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                              <span className="text-sm font-medium text-foreground">{caseType.type}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-muted-foreground">
                                  {caseType.count} cases ({((caseType.count / selectedCommissioner.hearingsCount) * 100).toFixed(0)}%)
                                </span>
                                <div className="w-24 bg-slate-200 rounded-full h-2">
                                  <div
                                    className="bg-primary h-2 rounded-full"
                                    style={{ width: `${(caseType.count / selectedCommissioner.hearingsCount) * 100}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Cases List */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Cases Overseen ({selectedCommissioner.transcripts.length})</h3>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {selectedCommissioner.transcripts.map((transcript) => (
                        <Card 
                          key={transcript.id} 
                          className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                          onClick={() => {
                            setSelectedCommissioner(null);
                            navigate(`/transcript/${transcript.id}`);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-foreground">
                                {transcript.inmate_name || "Unknown Applicant"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                CDCR: {transcript.cdcr_number || "N/A"} • {" "}
                                {transcript.hearing_date 
                                  ? new Date(transcript.hearing_date).toLocaleDateString()
                                  : "Date unknown"}
                              </p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default CommissionerBreakdown;


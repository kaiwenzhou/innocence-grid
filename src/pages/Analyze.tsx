import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TranscriptService } from "@/services/transcripts";
import { VolunteerService } from "@/services/volunteers";
import { Transcript } from "@/lib/types";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useVolunteer } from "@/context/VolunteerContext";
import { useNavigate } from "react-router-dom";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Scale
} from "lucide-react";

const Analyze = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentVolunteer, isAuthenticated } = useVolunteer();
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    withInnocenceClaims: 0,
    assigned: 0,
    unassigned: 0,
    completed: 0,
    highBiasRisk: 0,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      loadAnalytics();
    }
  }, [isAuthenticated]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const data = await TranscriptService.getAllTranscripts();
      setTranscripts(data);

      // Calculate statistics
      const total = data.length;
      const withInnocenceClaims = data.filter((t) =>
        hasInnocenceClaim(t.raw_text)
      ).length;
      const assigned = data.filter((t) => t.assigned_to).length;
      const unassigned = data.filter((t) => !t.assigned_to).length;
      const completed = data.filter((t) => t.status === "completed").length;
      
      // High bias risk: transcripts with commissioners from law enforcement
      const highBiasRisk = data.filter((t) => {
        const commissioners = extractCommissioners(t.raw_text);
        return commissioners.length > 0 && hasHighBiasRisk(commissioners);
      }).length;

      setStats({
        total,
        withInnocenceClaims,
        assigned,
        unassigned,
        completed,
        highBiasRisk,
      });
    } catch (error) {
      toast({
        title: "Error loading analytics",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hasInnocenceClaim = (text: string): boolean => {
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

  const extractCommissioners = (text: string): string[] => {
    const panelSectionMatch = text.match(/PANEL PRESENT:?\s*([\s\S]*?)(?:OTHERS PRESENT|$)/i);
    if (panelSectionMatch) {
      const panelSection = panelSectionMatch[1];
      const sectionMatches = panelSection.matchAll(/([A-Z]+(?:\s+[A-Z]+)+),?\s+(?:Presiding|Deputy)\s+Commissioner/gi);
      const names = new Set<string>();
      for (const match of sectionMatches) {
        const name = match[1].trim().toUpperCase();
        const wordCount = name.split(/\s+/).length;
        if (wordCount >= 2 && wordCount <= 4) {
          names.add(name);
        }
      }
      return Array.from(names);
    }
    return [];
  };

  const hasHighBiasRisk = (commissioners: string[]): boolean => {
    // Check if all commissioners are from law enforcement/prosecution
    const lawEnforcementCommissioners = [
      "MICHAEL RUFF",
      "KEVIN CHAPPELL",
      "GILBERT INFANTE",
      "DAVID LONG",
      "MICHELE MINOR",
      "WILLIAM MUNIZ",
      "NEIL SCHNEIDER",
    ];
    const prosecutionCommissioners = [
      "JULIE GARLAND",
      "CATHERINE PURCELL",
      "MARY THORNTON",
      "JACK WEISS",
    ];
    
    const biasedCount = commissioners.filter(
      (c) => lawEnforcementCommissioners.includes(c) || prosecutionCommissioners.includes(c)
    ).length;
    
    return biasedCount === commissioners.length && commissioners.length > 0;
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    description, 
    color = "primary" 
  }: { 
    title: string; 
    value: number; 
    icon: any; 
    description: string; 
    color?: string;
  }) => (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`h-12 w-12 rounded-full bg-${color}/10 flex items-center justify-center`}>
          <Icon className={`h-6 w-6 text-${color}`} />
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold text-foreground">{value}</p>
        <p className="text-sm font-semibold text-foreground mt-1">{title}</p>
        <p className="text-xs text-foreground/60 mt-2">{description}</p>
      </div>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            AI-Powered Transcript Analysis
          </h1>
          <p className="text-foreground/70 mt-2 font-medium">
            Real-time analytics across {stats.total} parole transcripts
          </p>
        </div>

        {/* Stats Grid */}
        {isLoading ? (
          <div className="text-center py-12 text-foreground/70 font-medium">
            Loading analytics...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Transcripts"
                value={stats.total}
                icon={FileText}
                description="Total parole hearing transcripts uploaded"
                color="primary"
              />
              <StatCard
                title="Innocence Claims"
                value={stats.withInnocenceClaims}
                icon={Scale}
                description="Transcripts with detected innocence language"
                color="purple"
              />
              <StatCard
                title="High Bias Risk"
                value={stats.highBiasRisk}
                icon={AlertTriangle}
                description="Panels with 100% law enforcement/prosecution"
                color="rose"
              />
              <StatCard
                title="Completed Reviews"
                value={stats.completed}
                icon={CheckCircle}
                description="Cases marked as completed"
                color="green"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                title="Assigned Cases"
                value={stats.assigned}
                icon={Users}
                description="Cases currently assigned to volunteers"
                color="primary"
              />
              <StatCard
                title="Unassigned Cases"
                value={stats.unassigned}
                icon={Clock}
                description="Cases waiting for assignment"
                color="amber"
              />
              <StatCard
                title="Completion Rate"
                value={Math.round((stats.completed / stats.total) * 100)}
                icon={TrendingUp}
                description="Percentage of cases completed"
                color="green"
              />
            </div>

            {/* Detailed Analysis Tabs */}
            <Card className="p-6">
              <Tabs defaultValue="innocence" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="innocence">Innocence Detection</TabsTrigger>
                  <TabsTrigger value="bias">Bias Analysis</TabsTrigger>
                  <TabsTrigger value="workload">Workload</TabsTrigger>
                </TabsList>

                <TabsContent value="innocence" className="space-y-4 mt-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      Innocence Claim Detection
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-100">
                        <div>
                          <p className="font-semibold text-foreground">Detection Rate</p>
                          <p className="text-sm text-foreground/60">
                            {((stats.withInnocenceClaims / stats.total) * 100).toFixed(1)}% of transcripts contain innocence-related language
                          </p>
                        </div>
                        <div className="text-3xl font-bold text-purple-600">
                          {stats.withInnocenceClaims}
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-lg border">
                        <p className="font-semibold text-foreground mb-2">Key Phrases Detected:</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="bg-white">
                            "maintain different circumstances"
                          </Badge>
                          <Badge variant="outline" className="bg-white">
                            "didn't do it"
                          </Badge>
                          <Badge variant="outline" className="bg-white">
                            "I am innocent"
                          </Badge>
                          <Badge variant="outline" className="bg-white">
                            "wrongly convicted"
                          </Badge>
                        </div>
                      </div>

                      <Button 
                        className="w-full" 
                        onClick={() => navigate("/clients")}
                      >
                        View All Cases with Innocence Claims
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="bias" className="space-y-4 mt-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      Commissioner Bias Analysis
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-rose-50 rounded-lg border border-rose-100">
                        <div>
                          <p className="font-semibold text-foreground">High Risk Panels</p>
                          <p className="text-sm text-foreground/60">
                            {((stats.highBiasRisk / stats.total) * 100).toFixed(1)}% of transcripts had 100% law enforcement/prosecution panels
                          </p>
                        </div>
                        <div className="text-3xl font-bold text-rose-600">
                          {stats.highBiasRisk}
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-lg border">
                        <p className="font-semibold text-foreground mb-3">Panel Composition Breakdown:</p>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-foreground/70">Law Enforcement Background:</span>
                            <Badge variant="outline" className="bg-rose-50 text-rose-700">7 commissioners</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-foreground/70">Prosecution Background:</span>
                            <Badge variant="outline" className="bg-rose-50 text-rose-700">4 commissioners</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-foreground/70">Mental Health Background:</span>
                            <Badge variant="outline" className="bg-purple-50 text-purple-700">2 commissioners</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-foreground/70">Legal/Judicial Background:</span>
                            <Badge variant="outline" className="bg-slate-50 text-slate-700">6 commissioners</Badge>
                          </div>
                        </div>
                      </div>

                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => navigate("/policy-data")}
                      >
                        View Full Bias Analysis Dashboard
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="workload" className="space-y-4 mt-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      Volunteer Workload Distribution
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-primary/5 rounded-lg border">
                          <p className="text-2xl font-bold text-foreground">{stats.assigned}</p>
                          <p className="text-sm text-foreground/60 mt-1">Cases Assigned</p>
                        </div>
                        <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                          <p className="text-2xl font-bold text-foreground">{stats.unassigned}</p>
                          <p className="text-sm text-foreground/60 mt-1">Cases Unassigned</p>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-lg border">
                        <p className="font-semibold text-foreground mb-3">Current User:</p>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{currentVolunteer?.full_name}</p>
                            <p className="text-sm text-foreground/60">{currentVolunteer?.role}</p>
                          </div>
                        </div>
                      </div>

                      <Button 
                        className="w-full"
                        onClick={() => navigate("/clients")}
                      >
                        Manage Case Assignments
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Analyze;


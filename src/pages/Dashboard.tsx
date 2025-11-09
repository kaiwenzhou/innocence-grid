import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { FileText, Upload, TrendingUp, Users, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PatternInsights } from "@/components/PatternInsights";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useVolunteer } from "@/context/VolunteerContext";
import { useToast } from "@/hooks/use-toast";
import { TranscriptService } from "@/services/transcripts";
import { SimilarityService } from "@/services/similarity";
import { Transcript } from "@/lib/types";

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentVolunteer, isAuthenticated } = useVolunteer();
  const { toast } = useToast();
  
  const [stats, setStats] = useState({
    total: 0,
    processed: 0,
    pending: 0
  });
  
  const [allTranscripts, setAllTranscripts] = useState<Transcript[]>([]);
  const [myAssignedCases, setMyAssignedCases] = useState<Transcript[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>("");
  const [patternData, setPatternData] = useState({
    commissionerInsights: [] as string[],
    innocenceInsights: [] as string[],
    outcomeInsights: [] as string[],
    totalSimilar: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated, currentVolunteer]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Get statistics
      const statsData = await TranscriptService.getStatistics();
      setStats(statsData);
      
      // Get all transcripts
      const transcripts = await TranscriptService.getAllTranscripts();
      setAllTranscripts(transcripts);
      
      // Filter to my assigned cases
      const myCases = currentVolunteer 
        ? transcripts.filter((t) => t.assigned_to === currentVolunteer.id)
        : [];
      setMyAssignedCases(myCases);
      
      // Auto-select first assigned case if available
      if (myCases.length > 0 && !selectedCaseId) {
        setSelectedCaseId(myCases[0].id);
        analyzeCase(myCases[0], transcripts);
      }
    } catch (error) {
      toast({
        title: "Error loading dashboard",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeCase = (targetCase: Transcript, allCases: Transcript[]) => {
    const insights = SimilarityService.getPatternInsights(targetCase, allCases);
    setPatternData(insights);
  };

  const handleCaseSelection = (caseId: string) => {
    setSelectedCaseId(caseId);
    const selectedCase = myAssignedCases.find((c) => c.id === caseId);
    if (selectedCase) {
      analyzeCase(selectedCase, allTranscripts);
    }
  };

  const selectedCase = myAssignedCases.find((c) => c.id === selectedCaseId);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-foreground/70 mt-2 font-medium">
            Pattern insights and case analytics
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground/60">Total Cases</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground/60">Processed</p>
                <p className="text-2xl font-bold text-foreground">{stats.processed}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground/60">My Cases</p>
                <p className="text-2xl font-bold text-foreground">{myAssignedCases.length}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground/60">Similar Found</p>
                <p className="text-2xl font-bold text-foreground">{patternData.totalSimilar}</p>
              </div>
              <Brain className="h-8 w-8 text-amber-600" />
            </div>
          </Card>
        </div>

        {/* Case Selection & Pattern Insights */}
        {myAssignedCases.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Case Selection */}
            <div className="lg:col-span-1 space-y-4">
              <Card className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">
                  Analyze Assigned Case
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground/70 mb-2 block">
                      Select a case:
                    </label>
                    <Select value={selectedCaseId} onValueChange={handleCaseSelection}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a case..." />
                      </SelectTrigger>
                      <SelectContent>
                        {myAssignedCases.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.inmate_name || c.file_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedCase && (
                    <div className="space-y-3 pt-4 border-t">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {selectedCase.inmate_name || "Name Unknown"}
                        </p>
                        <p className="text-xs text-foreground/60">
                          CDCR: {selectedCase.cdcr_number || "N/A"}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Button 
                          className="w-full" 
                          size="sm"
                          onClick={() => navigate(`/cases/${selectedCase.id}`)}
                        >
                          View Full Analysis
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full" 
                          size="sm"
                          onClick={() => navigate(`/transcript/${selectedCase.id}`)}
                        >
                          Read Transcript
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate("/clients")}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    View All Clients
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate("/analyze")}
                  >
                    <Brain className="mr-2 h-4 w-4" />
                    Platform Analytics
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate("/narratives")}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Build Narrative
                  </Button>
                </div>
              </Card>
            </div>

            {/* Right: Pattern Insights */}
            <div className="lg:col-span-2">
              <PatternInsights
                commissionerInsights={patternData.commissionerInsights}
                innocenceInsights={patternData.innocenceInsights}
                outcomeInsights={patternData.outcomeInsights}
                totalSimilar={patternData.totalSimilar}
              />
            </div>
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-30" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No Cases Assigned Yet
            </h3>
            <p className="text-foreground/60 mb-6">
              Go to the Clients page to view and assign cases to yourself.
            </p>
            <Button onClick={() => navigate("/clients")}>
              <Users className="mr-2 h-4 w-4" />
              Go to Clients
            </Button>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;

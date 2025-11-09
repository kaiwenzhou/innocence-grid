import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { FileText, TrendingUp, Users, Brain, Clock, CheckCircle, FileCheck, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { useVolunteer } from "@/context/VolunteerContext";
import { useToast } from "@/hooks/use-toast";
import { TranscriptService } from "@/services/transcripts";
import { FormProcessor } from "@/services/formProcessor";
import { MemoGeneratorEnhanced } from "@/services/memoGeneratorEnhanced";
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
  const [isLoading, setIsLoading] = useState(true);
  
  // Memoize Kanban column categorization - only recalculate when transcripts change
  const { assignedCases, underReviewCases, formGeneratedCases, readyForOutreachCases } = useMemo(() => {
    const assigned = allTranscripts.filter((t) => 
      t.assigned_to === currentVolunteer?.id && t.status === "assigned"
    );
    const underReview = allTranscripts.filter((t) => 
      t.assigned_to === currentVolunteer?.id && t.status === "in_review"
    );
    const formGenerated = allTranscripts.filter((t) => t.status === "completed" && t.processed);
    const readyForOutreach = allTranscripts.filter((t) => t.status === "flagged");
    
    return {
      assignedCases: assigned,
      underReviewCases: underReview,
      formGeneratedCases: formGenerated,
      readyForOutreachCases: readyForOutreach,
    };
  }, [allTranscripts, currentVolunteer]);

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
      
      // Get all transcripts - categorization happens automatically via useMemo
      const transcripts = await TranscriptService.getAllTranscripts();
      setAllTranscripts(transcripts);
      
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

  const handleGenerateForm = async (transcript: Transcript, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      toast({
        title: "Processing...",
        description: "Generating memorandum from transcript data",
      });

      // Generate form data using FormProcessor
      const formData = FormProcessor.processTranscriptForForm(transcript);
      
      // Generate memo using Enhanced MemoGenerator with deep parsing
      const memoData = MemoGeneratorEnhanced.generateMemoData(transcript);
      
      // Generate filename
      const clientName = transcript.inmate_name || "Unknown";
      const cdcr = transcript.cdcr_number || "Unknown";
      const fileName = `MEMO_${clientName.replace(/\s+/g, "_")}_${cdcr}_${Date.now()}.txt`;
      
      // Trigger download
      MemoGeneratorEnhanced.downloadMemo(memoData, fileName);
      
      // Update transcript status to "completed" and mark as processed
      const result = await TranscriptService.updateTranscript(transcript.id, {
        status: "completed",
        processed: true,
        form_data: formData,
      });

      if (result.success) {
        toast({
          title: "Form Generated & Downloaded!",
          description: "Memorandum downloaded to your computer. Case moved to Forms Generated column.",
        });
        
        // Reload dashboard to reflect changes
        await loadDashboardData();
      } else {
        throw new Error(result.error || "Failed to update transcript");
      }
    } catch (error) {
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  // Helper function to render case card for unassigned, form generated, or ready for outreach
  const renderCaseCard = (transcript: Transcript) => {
    const displayName = transcript.inmate_name || transcript.file_name?.replace(".pdf", "") || "Unknown";
    
    return (
      <Card 
        key={transcript.id} 
        className="p-4 mb-3 cursor-pointer hover:shadow-lg transition-shadow bg-white"
        onClick={() => navigate(`/transcript/${transcript.id}`)}
      >
        <div className="space-y-3">
          <div>
            <h4 className="font-bold text-sm text-black truncate">{displayName}</h4>
            {transcript.cdcr_number && (
              <p className="text-xs text-gray-600">CDCR: {transcript.cdcr_number}</p>
            )}
          </div>
          
          {transcript.hearing_date && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              {new Date(transcript.hearing_date).toLocaleDateString()}
            </div>
          )}
          
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1 h-7 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/cases/${transcript.id}`);
              }}
            >
              Analyze
            </Button>
            <Button 
              size="sm" 
              className="flex-1 h-7 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/transcript/${transcript.id}`);
              }}
            >
              View
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  // Helper function to render case card for under review (with Generate Form button)
  const renderUnderReviewCard = (transcript: Transcript) => {
    const displayName = transcript.inmate_name || transcript.file_name?.replace(".pdf", "") || "Unknown";
    
    return (
      <Card 
        key={transcript.id} 
        className="p-4 mb-3 cursor-pointer hover:shadow-lg transition-shadow bg-white"
        onClick={() => navigate(`/transcript/${transcript.id}`)}
      >
        <div className="space-y-3">
          <div>
            <h4 className="font-bold text-sm text-black truncate">{displayName}</h4>
            {transcript.cdcr_number && (
              <p className="text-xs text-gray-600">CDCR: {transcript.cdcr_number}</p>
            )}
          </div>
          
          {transcript.hearing_date && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              {new Date(transcript.hearing_date).toLocaleDateString()}
            </div>
          )}
          
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="default"
              className="flex-1 h-7 text-xs bg-green-600 hover:bg-green-700"
              onClick={(e) => handleGenerateForm(transcript, e)}
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Generate Form
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className="flex-1 h-7 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/transcript/${transcript.id}`);
              }}
            >
              View
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">My Case Pipeline</h1>
          <p className="text-white mt-2 font-medium">
            Track your cases through the review and outreach process
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="p-6 bg-white/95">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Cases</p>
                <p className="text-2xl font-bold text-black">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </Card>

          <Card className="p-6 bg-white/95">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Under Review</p>
                <p className="text-2xl font-bold text-black">{underReviewCases.length}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
          </Card>

          <Card className="p-6 bg-white/95">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Forms Generated</p>
                <p className="text-2xl font-bold text-black">{formGeneratedCases.length}</p>
              </div>
              <FileCheck className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6 bg-white/95">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Commissioner Panel Scheduled</p>
                <p className="text-2xl font-bold text-black">{readyForOutreachCases.length}</p>
              </div>
              <Send className="h-8 w-8 text-purple-600" />
            </div>
          </Card>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Column 1: Assigned to Me */}
          <div className="space-y-3">
            <div className="bg-blue-100 p-4 rounded-lg border-2 border-blue-300">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-black text-sm">Assigned to Me</h3>
                <Badge variant="secondary" className="bg-blue-200 text-black">
                  {assignedCases.length}
                </Badge>
              </div>
              <p className="text-xs text-gray-700">Cases assigned to me</p>
            </div>
            
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
              {isLoading ? (
                <Card className="p-4 text-center bg-white/95">
                  <p className="text-xs text-gray-500">Loading...</p>
                </Card>
              ) : assignedCases.length === 0 ? (
                <Card className="p-4 text-center bg-white/95">
                  <p className="text-xs text-gray-500">No assigned cases</p>
                </Card>
              ) : (
                assignedCases.map(renderCaseCard)
              )}
            </div>
          </div>

          {/* Column 2: Under Review */}
          <div className="space-y-3">
            <div className="bg-amber-100 p-4 rounded-lg border-2 border-amber-300">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-black text-sm">Under Review</h3>
                <Badge className="bg-amber-200 text-black">
                  {underReviewCases.length}
                </Badge>
              </div>
              <p className="text-xs text-gray-700">Cases being analyzed</p>
            </div>
            
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
              {isLoading ? (
                <Card className="p-4 text-center bg-white/95">
                  <p className="text-xs text-gray-500">Loading...</p>
                </Card>
              ) : underReviewCases.length === 0 ? (
                <Card className="p-4 text-center bg-white/95">
                  <p className="text-xs text-gray-500">No cases under review</p>
                </Card>
              ) : (
                underReviewCases.map(renderUnderReviewCard)
              )}
            </div>
          </div>

          {/* Column 3: Form Generated */}
          <div className="space-y-3">
            <div className="bg-green-100 p-4 rounded-lg border-2 border-green-300">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-black text-sm">Form AutoFilled + Outreach Completed</h3>
                <Badge className="bg-green-200 text-black">
                  {formGeneratedCases.length}
                </Badge>
              </div>
              <p className="text-xs text-gray-700">Forms generated and ready</p>
            </div>
            
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
              {isLoading ? (
                <Card className="p-4 text-center bg-white/95">
                  <p className="text-xs text-gray-500">Loading...</p>
                </Card>
              ) : formGeneratedCases.length === 0 ? (
                <Card className="p-4 text-center bg-white/95">
                  <p className="text-xs text-gray-500">No forms generated yet</p>
                </Card>
              ) : (
                formGeneratedCases.map(renderCaseCard)
              )}
            </div>
          </div>

          {/* Column 4: Commissioner Panel Scheduled */}
          <div className="space-y-3">
            <div className="bg-purple-100 p-4 rounded-lg border-2 border-purple-300">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-black text-sm">Commissioner Panel Scheduled</h3>
                <Badge className="bg-purple-200 text-black">
                  {readyForOutreachCases.length}
                </Badge>
              </div>
              <p className="text-xs text-gray-700">Panel hearing scheduled with commissioners</p>
            </div>
            
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
              {isLoading ? (
                <Card className="p-4 text-center bg-white/95">
                  <p className="text-xs text-gray-500">Loading...</p>
                </Card>
              ) : readyForOutreachCases.length === 0 ? (
                <Card className="p-4 text-center bg-white/95">
                  <p className="text-xs text-gray-500">No panels scheduled yet</p>
                </Card>
              ) : (
                readyForOutreachCases.map(renderCaseCard)
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;

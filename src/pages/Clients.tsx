import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Search, Plus, UserCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AIRecommendationsSidebar } from "@/components/AIRecommendationsSidebar";
import { TranscriptService } from "@/services/transcripts";
import { VolunteerService } from "@/services/volunteers";
import { PriorityService } from "@/services/priority";
import { extractKeyInnocenceIndicator } from "@/services/gemini";
import { Transcript, Volunteer, PriorityRecommendation } from "@/lib/types";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useVolunteer } from "@/context/VolunteerContext";
import { useNavigate } from "react-router-dom";

const Clients = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentVolunteer, isAuthenticated } = useVolunteer();
  const [clients, setClients] = useState<Transcript[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [recommendations, setRecommendations] = useState<PriorityRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [assignmentFilter, setAssignmentFilter] = useState<"all" | "my_cases" | "unassigned">("all");
  const [aiInsights, setAiInsights] = useState<Record<string, string>>({});

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      loadClients();
      loadVolunteers();
    }
  }, [isAuthenticated]);

  const loadClients = async () => {
    try {
      setIsLoading(true);
      const data = await TranscriptService.getAllTranscripts();
      setClients(data);
      
      // Load AI insights for all clients (in parallel, limit to first 20 for performance)
      loadAIInsights(data.slice(0, 20));
    } catch (error) {
      toast({
        title: "Error loading transcripts",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadAIInsights = async (transcripts: Transcript[]) => {
    // Load insights in batches to avoid overwhelming the API
    const batchSize = 5;
    const insights: Record<string, string> = {};

    for (let i = 0; i < transcripts.length; i += batchSize) {
      const batch = transcripts.slice(i, i + batchSize);
      const promises = batch.map(async (transcript) => {
        try {
          const insight = await extractKeyInnocenceIndicator(
            transcript.raw_text,
            transcript.inmate_name || undefined
          );
          return { id: transcript.id, insight };
        } catch (error) {
          console.error(`Error loading insight for ${transcript.id}:`, error);
          return {
            id: transcript.id,
            insight: `${transcript.inmate_name || 'Applicant'} parole hearing transcript available for review.`
          };
        }
      });

      const results = await Promise.all(promises);
      results.forEach(({ id, insight }) => {
        insights[id] = insight;
      });

      // Update state after each batch
      setAiInsights(prev => ({ ...prev, ...insights }));
    }
  };

  // Memoize AI recommendations calculation - only recalculate when clients change
  useEffect(() => {
    if (clients.length > 0) {
      const topRecommendations = PriorityService.getTopRecommendations(clients, 3);
      setRecommendations(topRecommendations);
    }
  }, [clients]);

  const loadVolunteers = async () => {
    try {
      const data = await VolunteerService.getAllVolunteers();
      setVolunteers(data);
    } catch (error) {
      toast({
        title: "Error loading volunteers",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  // Memoize callback functions to avoid unnecessary re-renders
  const handleAssignCase = useCallback(async (transcriptId: string, volunteerId: string) => {
    try {
      await VolunteerService.assignCase(transcriptId, volunteerId);
      toast({
        title: "Case assigned",
        description: "Case has been successfully assigned",
      });
      loadClients(); // Refresh the list
    } catch (error) {
      toast({
        title: "Assignment failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleUnassignCase = useCallback(async (transcriptId: string) => {
    try {
      await VolunteerService.unassignCase(transcriptId);
      toast({
        title: "Case unassigned",
        description: "Case has been unassigned",
      });
      loadClients(); // Refresh the list
    } catch (error) {
      toast({
        title: "Unassignment failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  }, [toast]);

  // AI Recommendations handlers
  const handleViewCase = useCallback((transcriptId: string) => {
    navigate(`/transcript/${transcriptId}`);
  }, [navigate]);

  const handleAnalyzeCase = useCallback((transcriptId: string) => {
    navigate(`/cases/${transcriptId}`);
  }, [navigate]);

  const handleAssignToMe = useCallback(async (transcriptId: string) => {
    if (!currentVolunteer) {
      toast({
        title: "Error",
        description: "You must be logged in to assign cases",
        variant: "destructive",
      });
      return;
    }
    await handleAssignCase(transcriptId, currentVolunteer.id);
  }, [currentVolunteer, handleAssignCase, toast]);

  const getVolunteerName = (volunteerId: string | null): string => {
    if (!volunteerId) return "Unassigned";
    const volunteer = volunteers.find((v) => v.id === volunteerId);
    return volunteer ? volunteer.full_name : "Unknown";
  };

  // Get AI-generated innocence insight or fallback to basic extraction
  const getInnocenceInsight = (client: Transcript): string => {
    // Return AI insight if available
    if (aiInsights[client.id]) {
      return aiInsights[client.id];
    }

    // Fallback: Simple extraction while waiting for AI
    if (!client.raw_text) return "No transcript content available.";
    
    const innocencePatterns = [
      /I\s+(?:did\s+not|didn't)\s+do\s+(?:this|it)/i,
      /I\s+am\s+innocent/i,
      /I\s+maintain\s+(?:my\s+)?innocence/i,
      /I\s+was\s+not\s+there/i,
      /(?:pleaded|pled)\s+not\s+guilty/i,
    ];

    for (const pattern of innocencePatterns) {
      const match = client.raw_text.match(pattern);
      if (match) {
        const excerpt = match[0].substring(0, 100).replace(/\s+/g, ' ').trim();
        return excerpt + (match[0].length > 100 ? '...' : '');
      }
    }

    // Loading AI insight...
    return `Analyzing transcript for key innocence indicators...`;
  };

  // Calculate case strength based on available data
  const calculateCaseStrength = (transcript: Transcript): "high" | "medium" | "low" => {
    let score = 0;
    
    // Has inmate name
    if (transcript.inmate_name) score++;
    // Has CDCR number
    if (transcript.cdcr_number) score++;
    // Has hearing date
    if (transcript.hearing_date) score++;
    // Has substantial content
    if (transcript.raw_text && transcript.raw_text.length > 1000) score++;
    // Contains innocence keywords
    if (transcript.raw_text && /I\s+(?:did\s+not|didn't)\s+do|innocent|not\s+guilty/i.test(transcript.raw_text)) score++;

    if (score >= 4) return "high";
    if (score >= 2) return "medium";
    return "low";
  };

  // Determine status
  const getStatus = (transcript: Transcript): "in_progress" | "new" | "closed" => {
    if (transcript.processed) return "closed";
    // For demo, mark recent uploads as in_progress
    const uploadDate = new Date(transcript.uploaded_at);
    const daysSinceUpload = (Date.now() - uploadDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceUpload < 7 ? "in_progress" : "new";
  };

  // Memoize filtered clients - only recalculate when dependencies change
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesSearch =
          client.inmate_name?.toLowerCase().includes(search) ||
          client.cdcr_number?.toLowerCase().includes(search) ||
          client.file_name?.toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }

      // Assignment filter
      if (assignmentFilter === "my_cases" && currentVolunteer) {
        return client.assigned_to === currentVolunteer.id;
      } else if (assignmentFilter === "unassigned") {
        return !client.assigned_to || client.status === "unassigned";
      }

      return true; // "all" filter or no filter
    });
  }, [clients, searchTerm, assignmentFilter, currentVolunteer]);
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-sm">
            Clients Identified from Parole Hearing Transcripts
          </h1>
          <p className="text-white mt-2 font-medium">
            {isLoading ? "Loading..." : `${filteredClients.length} of ${clients.length} transcripts`}
          </p>
        </div>

        {/* Main Layout: Left Column (Client Cards) + Right Column (AI Recommendations) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Client Cards (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name, CDCR number, or filename..."
              className="pl-10 text-white placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={assignmentFilter} onValueChange={(value: any) => setAssignmentFilter(value)}>
            <SelectTrigger className="w-[180px] text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cases</SelectItem>
              <SelectItem value="my_cases">My Assigned Cases</SelectItem>
              <SelectItem value="unassigned">Unassigned Cases</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="gap-2 text-white">
            <Calendar className="h-4 w-4" />
            Dates
          </Button>

          <Select defaultValue="all">
            <SelectTrigger className="w-[160px] text-white">
              <SelectValue placeholder="Case Strength" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Strengths</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all">
            <SelectTrigger className="w-[160px] text-white">
              <SelectValue placeholder="Sentence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sentences</SelectItem>
              <SelectItem value="life">Life</SelectItem>
              <SelectItem value="25plus">25+ Years</SelectItem>
              <SelectItem value="under25">Under 25 Years</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all">
            <SelectTrigger className="w-[160px] text-white">
              <SelectValue placeholder="Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="domestic">Domestic Violence</SelectItem>
              <SelectItem value="murder">Murder</SelectItem>
              <SelectItem value="assault">Assault</SelectItem>
            </SelectContent>
          </Select>

          <Button size="icon" variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Client Cards Grid */}
        {isLoading ? (
          <div className="text-center py-12 text-white font-medium">
            Loading transcripts...
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-12 text-white font-medium">
            {searchTerm ? "No transcripts match your search." : "No transcripts found. Upload transcripts to get started."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredClients.map((client) => {
              const caseStrength = calculateCaseStrength(client);
              const status = getStatus(client);
              const innocenceInsight = getInnocenceInsight(client);
              const displayName = client.inmate_name || "Unknown Applicant";

              return (
                <Card key={client.id} className="p-6 space-y-4 hover:shadow-lg transition-shadow">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{displayName}</h3>
                      <p className="text-sm text-foreground/60 font-medium">
                        CDCR: {client.cdcr_number || "Not available"}
                      </p>
                    </div>
                    {getStrengthBadge(caseStrength)}
                  </div>

                  {/* Status & Assignment */}
                  <div className="flex flex-wrap gap-2">
                    {getStatusBadge(status)}
                    {client.assigned_to && (
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 gap-1">
                        <UserCircle className="h-3 w-3" />
                        {getVolunteerName(client.assigned_to)}
                      </Badge>
                    )}
                  </div>

                  {/* Client Info */}
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/20 text-primary font-bold">
                        {getInitials(displayName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground">{displayName}</p>
                      <p className="text-sm text-foreground/60">
                        {client.hearing_date 
                          ? new Date(client.hearing_date).toLocaleDateString()
                          : "Hearing date unknown"}
                      </p>
                    </div>
                  </div>

                  {/* AI-Generated Innocence Insight */}
                  <p className="text-sm text-foreground/70 line-clamp-3 leading-relaxed italic">
                    {innocenceInsight}
                  </p>

                  {/* Actions */}
                  <div className="space-y-2 pt-2">
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1 bg-primary hover:bg-primary/90"
                        onClick={() => window.location.href = `/transcript/${client.id}`}
                      >
                        View Case
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => window.location.href = `/cases/${client.id}`}
                      >
                        Analyze
                      </Button>
                    </div>

                    {/* Assignment Dropdown */}
                    <Select
                      value={client.assigned_to || "unassigned"}
                      onValueChange={(value) => {
                        if (value === "unassigned") {
                          handleUnassignCase(client.id);
                        } else {
                          handleAssignCase(client.id, value);
                        }
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Assign to...">
                          {client.assigned_to 
                            ? getVolunteerName(client.assigned_to)
                            : "UNASSIGNED"
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">
                          <span className="text-muted-foreground">Unassigned</span>
                        </SelectItem>
                        {volunteers.map((volunteer) => (
                          <SelectItem key={volunteer.id} value={volunteer.id}>
                            {volunteer.full_name}
                            {volunteer.id === currentVolunteer?.id && " (You)"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
          </div>
          {/* End of Left Column */}

          {/* Right Column: AI Recommendations Sidebar (1/3 width) */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <AIRecommendationsSidebar
                recommendations={recommendations}
                onViewCase={handleViewCase}
                onAnalyze={handleAnalyzeCase}
                onAssign={handleAssignToMe}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
        {/* End of Grid */}
      </div>
    </DashboardLayout>
  );
};

export default Clients;


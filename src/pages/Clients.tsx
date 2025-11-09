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
import { Calendar, Search, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TranscriptService } from "@/services/transcripts";
import { Transcript } from "@/lib/types";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const Clients = () => {
  const { toast } = useToast();
  const [clients, setClients] = useState<Transcript[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setIsLoading(true);
      const data = await TranscriptService.getAllTranscripts();
      setClients(data);
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

  // Simple innocence claim extraction from transcript text
  const extractInnocenceClaim = (rawText: string, inmateName: string | null): string => {
    if (!rawText) return "No transcript content available.";

    // Look for common innocence phrases
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
        // Get surrounding context (up to 100 characters before and after)
        const matchIndex = rawText.indexOf(match[0]);
        const start = Math.max(0, matchIndex - 50);
        const end = Math.min(rawText.length, matchIndex + match[0].length + 100);
        let excerpt = rawText.substring(start, end).replace(/\s+/g, ' ').trim();
        if (start > 0) excerpt = '...' + excerpt;
        if (end < rawText.length) excerpt = excerpt + '...';
        return excerpt;
      }
    }

    // If no innocence claim found, return a generic message
    return `${inmateName || 'Applicant'} parole hearing transcript available for review.`;
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

  // Filter clients based on search
  const filteredClients = clients.filter((client) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      client.inmate_name?.toLowerCase().includes(search) ||
      client.cdcr_number?.toLowerCase().includes(search) ||
      client.file_name?.toLowerCase().includes(search)
    );
  });
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
          <h1 className="text-3xl font-bold tracking-tight">
            Clients Identified from Parole Hearing Transcripts
          </h1>
          <p className="text-muted-foreground mt-2">
            {isLoading ? "Loading..." : `${filteredClients.length} of ${clients.length} transcripts`}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, CDCR number, or filename..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            Dates
          </Button>

          <Select defaultValue="all">
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Clients" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all">
            <SelectTrigger className="w-[160px]">
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
            <SelectTrigger className="w-[160px]">
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
            <SelectTrigger className="w-[160px]">
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
          <div className="text-center py-12 text-muted-foreground">
            Loading transcripts...
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {searchTerm ? "No transcripts match your search." : "No transcripts found. Upload transcripts to get started."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredClients.map((client) => {
              const caseStrength = calculateCaseStrength(client);
              const status = getStatus(client);
              const innocenceClaim = extractInnocenceClaim(client.raw_text, client.inmate_name);
              const displayName = client.inmate_name || "Unknown Applicant";

              return (
                <Card key={client.id} className="p-6 space-y-4 hover:shadow-lg transition-shadow">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-primary">{displayName}</h3>
                      <p className="text-sm text-muted-foreground">
                        CDCR: {client.cdcr_number || "Not available"}
                      </p>
                    </div>
                    {getStrengthBadge(caseStrength)}
                  </div>

                  {/* Status */}
                  <div>
                    {getStatusBadge(status)}
                  </div>

                  {/* Client Info */}
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(displayName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{displayName}</p>
                      <p className="text-sm text-muted-foreground">
                        {client.hearing_date
                          ? new Date(client.hearing_date).toLocaleDateString()
                          : "Hearing date unknown"}
                      </p>
                    </div>
                  </div>

                  {/* Innocence Claim */}
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {innocenceClaim}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      className="flex-1 bg-primary hover:bg-primary/90"
                      onClick={() => window.location.href = `/transcript/${client.id}`}
                    >
                      View Case
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => window.location.href = `/cases`}
                    >
                      Analyze
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Clients;

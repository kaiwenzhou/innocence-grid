import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Transcript } from "@/lib/types";
import { TranscriptService } from "@/services/transcripts";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Search, Plus, MoreVertical, ArrowUpDown, Upload } from "lucide-react";
import { fixAllTranscriptNames } from "@/utils/fixTranscriptNames";

const Transcripts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    loadTranscripts();
    // Make fix function available in console for debugging
    if (typeof window !== 'undefined') {
      (window as any).fixAllTranscriptNames = fixAllTranscriptNames;
    }
  }, []);

  const loadTranscripts = async () => {
    try {
      setIsLoading(true);
      const data = await TranscriptService.getAllTranscripts();
      setTranscripts(data);
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

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const filteredTranscripts = [...transcripts].sort((a, b) => {
    if (!sortColumn) {
      // Default sort by uploaded_at descending
      return new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime();
    }

    let aVal: any = a[sortColumn as keyof typeof a];
    let bVal: any = b[sortColumn as keyof typeof b];

    if (sortColumn === "uploaded_at") {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    }

    if (sortDirection === "asc") {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getFeasibilityBadge = (score: number = 0.5) => {
    if (score >= 0.7) {
      return <span className="text-sm">high</span>;
    } else if (score >= 0.4) {
      return <span className="text-sm">medium</span>;
    }
    return <span className="text-sm">low</span>;
  };

  const getProgressBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      active: { label: "Active", className: "bg-emerald-50 text-emerald-700 border border-emerald-100" },
      in_progress: { label: "In progress", className: "bg-purple-50 text-purple-700 border border-purple-100" },
      closed: { label: "Closed", className: "bg-slate-50 text-slate-600 border border-slate-200" },
      not_started: { label: "Not started", className: "bg-slate-50 text-slate-500 border border-slate-200" },
    };
    const statusInfo = statusMap[status] || statusMap.not_started;
    return (
      <Badge variant="outline" className={statusInfo.className}>
        {statusInfo.label}
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-sm">Transcripts Extracted</h1>
          <Button 
            onClick={() => navigate("/upload")}
            className="bg-white text-slate-900 hover:bg-slate-100 font-semibold gap-2 shadow-lg"
          >
            <Upload className="h-5 w-5" />
            Upload Transcript
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white" />
            <Input placeholder="Search" className="pl-10 text-white placeholder:text-slate-300" />
          </div>

          <Button variant="outline" className="gap-2 text-white">
            <Calendar className="h-4 w-4" />
            Dates
          </Button>

          <Select defaultValue="all">
            <SelectTrigger className="w-[160px] text-white">
              <SelectValue placeholder="All Clients" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
            </SelectContent>
          </Select>

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
            </SelectContent>
          </Select>

          <Button size="icon" variant="outline" className="text-white">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Table */}
        <Card className="border-border bg-card">
          {isLoading ? (
            <div className="text-center py-8 text-slate-200 font-medium">Loading transcripts...</div>
          ) : transcripts.length === 0 ? (
            <div className="text-center py-8 text-slate-200 font-medium">
              No transcripts uploaded yet. Upload your first transcript to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b">
                  <TableHead className="w-12">
                    <Checkbox />
                  </TableHead>
                  <TableHead className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      Transcript ID
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      Client Identified
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Case Feasibility</TableHead>
                  <TableHead className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      Case Progress
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Case In-Charge</TableHead>
                  <TableHead>Case Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTranscripts.map((transcript, index) => (
                  <TableRow
                    key={transcript.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/transcript/${transcript.id}`)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox />
                    </TableCell>
                    <TableCell className="font-medium">
                      {String(index + 1).padStart(5, '0')}
                    </TableCell>
                    <TableCell>{transcript.inmate_name || 'Unknown'}</TableCell>
                    <TableCell>
                      {getFeasibilityBadge(0.5)}
                    </TableCell>
                    <TableCell>
                      {getProgressBadge(transcript.processed ? 'active' : 'not_started')}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {['Ashton S', 'Kylie', 'Rohan', 'Yohan', 'Jenny Cao'][index % 5]}
                    </TableCell>
                    <TableCell>
                      {transcript.processed ? (
                        <span className="text-sm text-foreground">In progress</span>
                      ) : (
                        <span className="text-sm text-foreground">Not started</span>
                      )}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/transcript/${transcript.id}`)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/cases`)}>
                            Analyze
                          </DropdownMenuItem>
                          <DropdownMenuItem>Assign</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Transcripts;

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
import { Transcript } from "@/lib/types";
import { TranscriptService } from "@/services/transcripts";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Transcripts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    loadTranscripts();
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (processed: boolean) => {
    if (processed) {
      return <Badge className="bg-success">Processed</Badge>;
    }
    return <Badge variant="secondary">Pending</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transcripts</h1>
          <p className="text-muted-foreground">Review and analyze court transcripts</p>
        </div>

        <Card className="border-border bg-card p-6">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading transcripts...
            </div>
          ) : transcripts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transcripts uploaded yet. Upload your first transcript to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer hover:text-foreground"
                    onClick={() => handleSort("file_name")}
                  >
                    Filename {sortColumn === "file_name" && (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:text-foreground"
                    onClick={() => handleSort("inmate_name")}
                  >
                    Inmate Name{" "}
                    {sortColumn === "inmate_name" && (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:text-foreground"
                    onClick={() => handleSort("cdcr_number")}
                  >
                    CDCR Number{" "}
                    {sortColumn === "cdcr_number" && (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:text-foreground"
                    onClick={() => handleSort("hearing_date")}
                  >
                    Hearing Date{" "}
                    {sortColumn === "hearing_date" && (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:text-foreground"
                    onClick={() => handleSort("uploaded_at")}
                  >
                    Uploaded{" "}
                    {sortColumn === "uploaded_at" && (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTranscripts.map((transcript) => (
                  <TableRow
                    key={transcript.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/transcript/${transcript.id}`)}
                  >
                    <TableCell className="font-medium">{transcript.file_name}</TableCell>
                    <TableCell>{transcript.inmate_name || '—'}</TableCell>
                    <TableCell>{transcript.cdcr_number || '—'}</TableCell>
                    <TableCell>
                      {transcript.hearing_date
                        ? new Date(transcript.hearing_date).toLocaleDateString()
                        : '—'}
                    </TableCell>
                    <TableCell>{formatDate(transcript.uploaded_at)}</TableCell>
                    <TableCell>{getStatusBadge(transcript.processed)}</TableCell>
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

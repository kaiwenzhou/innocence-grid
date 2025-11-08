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
import { Transcript } from "@/lib/mockData";
import { TranscriptService } from "@/services/transcripts";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

const Transcripts = () => {
  const navigate = useNavigate();
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [scoreFilter, setScoreFilter] = useState([0, 1]);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    TranscriptService.getAllTranscripts().then(setTranscripts);
  }, []);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const filteredTranscripts = transcripts
    .filter(
      (t) => t.innocenceScore >= scoreFilter[0] && t.innocenceScore <= scoreFilter[1]
    )
    .sort((a, b) => {
      if (!sortColumn) return 0;
      
      let aVal: any = a[sortColumn as keyof typeof a];
      let bVal: any = b[sortColumn as keyof typeof b];
      
      if (sortColumn === "dateUploaded") {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }
      
      if (sortDirection === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

  const getScoreBadge = (score: number) => {
    if (score >= 0.7) return <Badge className="bg-success">High Risk</Badge>;
    if (score >= 0.5) return <Badge className="bg-warning">Medium Risk</Badge>;
    return <Badge variant="secondary">Low Risk</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transcripts</h1>
          <p className="text-muted-foreground">Review and analyze court transcripts</p>
        </div>

        <Card className="border-border bg-card p-6">
          <div className="mb-6 space-y-4">
            <div>
              <Label>Filter by Innocence Score</Label>
              <div className="flex items-center gap-4 pt-4">
                <span className="text-sm text-muted-foreground">
                  {scoreFilter[0].toFixed(2)}
                </span>
                <Slider
                  value={scoreFilter}
                  onValueChange={setScoreFilter}
                  max={1}
                  step={0.01}
                  className="flex-1"
                  minStepsBetweenThumbs={0}
                />
                <span className="text-sm text-muted-foreground">
                  {scoreFilter[1].toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer hover:text-foreground"
                  onClick={() => handleSort("id")}
                >
                  ID {sortColumn === "id" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:text-foreground"
                  onClick={() => handleSort("filename")}
                >
                  Filename {sortColumn === "filename" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:text-foreground"
                  onClick={() => handleSort("innocenceScore")}
                >
                  Innocence Score{" "}
                  {sortColumn === "innocenceScore" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:text-foreground"
                  onClick={() => handleSort("dateUploaded")}
                >
                  Date Uploaded{" "}
                  {sortColumn === "dateUploaded" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead>Risk Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTranscripts.map((transcript) => (
                <TableRow
                  key={transcript.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/transcript/${transcript.id}`)}
                >
                  <TableCell className="font-medium">{transcript.id}</TableCell>
                  <TableCell>{transcript.filename}</TableCell>
                  <TableCell>{transcript.innocenceScore.toFixed(2)}</TableCell>
                  <TableCell>{transcript.dateUploaded}</TableCell>
                  <TableCell>{getScoreBadge(transcript.innocenceScore)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Transcripts;

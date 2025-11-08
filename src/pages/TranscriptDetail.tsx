import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useParams, useNavigate } from "react-router-dom";
import { Transcript, Claim } from "@/lib/mockData";
import { TranscriptService } from "@/services/transcripts";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";

const TranscriptDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      TranscriptService.getTranscriptById(id).then(data => {
        setTranscript(data);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!transcript) {
    return (
      <DashboardLayout>
        <div className="text-center">
          <h1 className="text-2xl font-bold">Transcript not found</h1>
          <Button onClick={() => navigate("/transcripts")} className="mt-4">
            Back to Transcripts
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const highlightText = (text: string, claims: Claim[]) => {
    let lastIndex = 0;
    const parts: React.ReactNode[] = [];

    // Sort claims by start index
    const sortedClaims = [...claims].sort((a, b) => a.startIndex - b.startIndex);

    sortedClaims.forEach((claim, idx) => {
      // Add text before the claim
      if (claim.startIndex > lastIndex) {
        parts.push(
          <span key={`text-${idx}`}>
            {text.substring(lastIndex, claim.startIndex)}
          </span>
        );
      }

      // Add the highlighted claim
      parts.push(
        <mark
          key={`claim-${idx}`}
          className="bg-accent/30 text-accent-foreground rounded px-1"
        >
          {text.substring(claim.startIndex, claim.endIndex)}
        </mark>
      );

      lastIndex = claim.endIndex;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(<span key="text-end">{text.substring(lastIndex)}</span>);
    }

    return parts;
  };

  const getScoreBadge = (score: number) => {
    if (score >= 0.7) return <Badge className="bg-success text-lg">High Risk</Badge>;
    if (score >= 0.5) return <Badge className="bg-warning text-lg">Medium Risk</Badge>;
    return <Badge variant="secondary" className="text-lg">Low Risk</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate("/transcripts")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Transcripts
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{transcript.filename}</h1>
          <p className="text-muted-foreground">
            Uploaded on {transcript.dateUploaded}
          </p>
        </div>

        <Card className="border-border bg-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Innocence Assessment</h2>
              <div className="flex items-center gap-4">
                <span className="text-4xl font-bold">
                  {(transcript.innocenceScore * 100).toFixed(0)}%
                </span>
                {getScoreBadge(transcript.innocenceScore)}
              </div>
            </div>
            {transcript.innocenceScore >= 0.7 && (
              <AlertTriangle className="h-12 w-12 text-warning" />
            )}
          </div>

          <Separator className="my-6" />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Extracted Claims</h3>
            {transcript.claims.map((claim, idx) => (
              <Card key={idx} className="border-accent/30 bg-accent/5 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm mb-2">{claim.text}</p>
                  </div>
                  <Badge variant="outline">
                    {(claim.confidence * 100).toFixed(0)}% confidence
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        <Card className="border-border bg-card p-6">
          <h2 className="text-xl font-semibold mb-4">Full Transcript</h2>
          <div className="prose prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {highlightText(transcript.content, transcript.claims)}
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TranscriptDetail;

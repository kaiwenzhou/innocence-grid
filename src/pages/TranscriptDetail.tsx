import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useParams, useNavigate } from "react-router-dom";
import { Transcript } from "@/lib/types";
import { TranscriptService } from "@/services/transcripts";
import { InnocenceDetectorService } from "@/services/innocenceDetector";
import { ArrowLeft, AlertTriangle, Calendar, User, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

const TranscriptDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  useEffect(() => {
    if (id) {
      TranscriptService.getTranscriptById(id).then(data => {
        setTranscript(data);
        setLoading(false);
      });
    }
  }, [id]);

  const handleAnalyze = async () => {
    if (!transcript) return;

    setAnalyzing(true);
    setAnalysisProgress(0);

    try {
      toast.info("Starting innocence analysis...");

      await InnocenceDetectorService.analyzeTranscript(
        transcript.id,
        transcript.raw_text,
        (progress) => {
          setAnalysisProgress(progress);
        }
      );

      toast.success("Analysis completed successfully!");

      // Refresh transcript data to get the prediction
      const updatedTranscript = await TranscriptService.getTranscriptById(transcript.id);
      setTranscript(updatedTranscript);
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Failed to analyze transcript. Please try again.");
    } finally {
      setAnalyzing(false);
      setAnalysisProgress(0);
    }
  };

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

  const getScoreBadge = (score: number) => {
    if (score >= 0.7) return <Badge className="bg-success text-lg">High Risk</Badge>;
    if (score >= 0.5) return <Badge className="bg-warning text-lg">Medium Risk</Badge>;
    return <Badge variant="secondary" className="text-lg">Low Risk</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          <h1 className="text-3xl font-bold tracking-tight">{transcript.file_name}</h1>
          <p className="text-muted-foreground">
            Uploaded on {formatDate(transcript.uploaded_at)}
          </p>
        </div>

        {/* Metadata Card */}
        <Card className="border-border bg-card p-6">
          <h2 className="text-xl font-semibold mb-4">Transcript Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {transcript.hearing_date && (
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Hearing Date</p>
                  <p className="font-medium">{new Date(transcript.hearing_date).toLocaleDateString()}</p>
                </div>
              </div>
            )}
            {transcript.inmate_name && (
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Inmate Name</p>
                  <p className="font-medium">{transcript.inmate_name}</p>
                </div>
              </div>
            )}
            {transcript.cdcr_number && (
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">CDCR Number</p>
                  <p className="font-medium">{transcript.cdcr_number}</p>
                </div>
              </div>
            )}
          </div>
          <div className="mt-4 flex items-center gap-4">
            <Badge variant={transcript.processed ? "default" : "secondary"}>
              {transcript.processed ? "Processed" : "Pending Analysis"}
            </Badge>
            {!transcript.prediction && (
              <Button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="ml-auto"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {analyzing ? "Analyzing..." : "Analyze with AI"}
              </Button>
            )}
          </div>
          {analyzing && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Processing transcript...</span>
                <span className="font-medium">{analysisProgress}%</span>
              </div>
              <Progress value={analysisProgress} className="h-2" />
            </div>
          )}
        </Card>

        {/* Innocence Assessment Card - Only show if prediction exists */}
        {transcript.prediction && transcript.prediction.innocence_score !== null && (
          <Card className="border-border bg-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">Innocence Assessment</h2>
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-bold">
                    {(transcript.prediction.innocence_score * 100).toFixed(0)}%
                  </span>
                  {getScoreBadge(transcript.prediction.innocence_score)}
                </div>
              </div>
              {transcript.prediction.innocence_score >= 0.7 && (
                <AlertTriangle className="h-12 w-12 text-warning" />
              )}
            </div>

            <Separator className="my-6" />

            {/* Explicit Claims */}
            {transcript.prediction.explicit_claims && transcript.prediction.explicit_claims.length > 0 && (
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-semibold">Explicit Claims</h3>
                {transcript.prediction.explicit_claims.map((claim: any, idx: number) => (
                  <Card key={idx} className="border-accent/30 bg-accent/5 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm mb-2">{claim.text || JSON.stringify(claim)}</p>
                      </div>
                      {claim.confidence && (
                        <Badge variant="outline">
                          {(claim.confidence * 100).toFixed(0)}% confidence
                        </Badge>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Implicit Signals */}
            {transcript.prediction.implicit_signals && transcript.prediction.implicit_signals.length > 0 && (
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-semibold">Implicit Signals</h3>
                {transcript.prediction.implicit_signals.map((signal: any, idx: number) => (
                  <Card key={idx} className="border-border bg-card/50 p-4">
                    <p className="text-sm">{signal.text || JSON.stringify(signal)}</p>
                  </Card>
                ))}
              </div>
            )}

            {/* Contextual Signals */}
            {transcript.prediction.contextual_signals && transcript.prediction.contextual_signals.length > 0 && (
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-semibold">Contextual Signals</h3>
                {transcript.prediction.contextual_signals.map((signal: any, idx: number) => (
                  <Card key={idx} className="border-primary/30 bg-primary/5 p-4">
                    <p className="text-sm">{signal.text || JSON.stringify(signal)}</p>
                  </Card>
                ))}
              </div>
            )}

            {/* Bias Language */}
            {transcript.prediction.bias_language && transcript.prediction.bias_language.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Bias Language Detected</h3>
                {transcript.prediction.bias_language.map((signal: any, idx: number) => (
                  <Card key={idx} className="border-warning/30 bg-warning/5 p-4">
                    <p className="text-sm">{signal.text || JSON.stringify(signal)}</p>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Full Transcript Card */}
        <Card className="border-border bg-card p-6">
          <h2 className="text-xl font-semibold mb-4">Full Transcript</h2>
          <div className="prose prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {transcript.raw_text}
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TranscriptDetail;

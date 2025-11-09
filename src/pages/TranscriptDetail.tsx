import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useParams, useNavigate } from "react-router-dom";
import { Transcript } from "@/lib/types";
import { TranscriptService } from "@/services/transcripts";
import { ArrowLeft, AlertTriangle, Calendar, User, FileText, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { analyzeTranscriptForInnocence, type AnalysisProgress } from "@/services/innocenceDetector";
import { useToast } from "@/hooks/use-toast";

const TranscriptDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgress | null>(null);

  const loadTranscript = async () => {
    if (id) {
      const data = await TranscriptService.getTranscriptById(id);
      setTranscript(data);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTranscript();
  }, [id]);

  const handleAnalyze = async () => {
    if (!id) return;

    setAnalyzing(true);
    setAnalysisProgress(null);

    try {
      const result = await analyzeTranscriptForInnocence(
        id,
        (progress) => {
          setAnalysisProgress(progress);
        }
      );

      if (result.success) {
        toast({
          title: "Analysis Complete",
          description: `Innocence score: ${(result.innocenceScore * 100).toFixed(0)}%. Found ${result.explicitClaims.length} explicit claims.`,
        });

        // Reload transcript to show new results
        await loadTranscript();
      } else {
        toast({
          title: "Analysis Failed",
          description: result.error || "Unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
      setAnalysisProgress(null);
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
          <div className="mt-4 flex items-center gap-3">
            <Badge variant={transcript.processed ? "default" : "secondary"}>
              {transcript.processed ? "Processed" : "Pending Analysis"}
            </Badge>
            <Button
              onClick={handleAnalyze}
              disabled={analyzing}
              size="sm"
              className="ml-auto"
            >
              {analyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Analyze for Innocence Signals
                </>
              )}
            </Button>
          </div>

          {/* Analysis Progress */}
          {analyzing && analysisProgress && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{analysisProgress.status}</span>
                <span className="font-medium">{analysisProgress.percentage}%</span>
              </div>
              <Progress value={analysisProgress.percentage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Processing chunk {analysisProgress.currentChunk} of {analysisProgress.totalChunks}
              </p>
            </div>
          )}
        </Card>

        {/* Innocence Assessment Card - Only show if prediction exists */}
        {transcript.prediction && transcript.prediction.innocence_score !== null && (
          <Card className="border-border bg-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">Innocence Signal Detection Results</h2>
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-bold">
                    {(transcript.prediction.innocence_score * 100).toFixed(0)}%
                  </span>
                  {getScoreBadge(transcript.prediction.innocence_score)}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Analyzed with {transcript.prediction.model_version || 'Gemini AI'}
                </p>
              </div>
              {transcript.prediction.innocence_score >= 0.7 && (
                <AlertTriangle className="h-12 w-12 text-warning" />
              )}
            </div>

            <Separator className="my-6" />

            {/* Explicit Claims */}
            {transcript.prediction.explicit_claims && transcript.prediction.explicit_claims.length > 0 && (
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Explicit Innocence Claims</h3>
                  <Badge variant="default">{transcript.prediction.explicit_claims.length}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Direct statements of innocence from the inmate
                </p>
                {transcript.prediction.explicit_claims.map((claim: any, idx: number) => (
                  <Card key={idx} className="border-red-500/30 bg-red-500/5 p-4">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium mb-2 leading-relaxed">{claim.text}</p>
                        {claim.explanation && (
                          <p className="text-xs text-muted-foreground italic">{claim.explanation}</p>
                        )}
                      </div>
                      {claim.confidence && (
                        <Badge variant="outline" className="shrink-0">
                          {(claim.confidence * 100).toFixed(0)}%
                        </Badge>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Implicit Signals - Filter by type */}
            {transcript.prediction.implicit_signals && transcript.prediction.implicit_signals.length > 0 && (() => {
              const implicit = transcript.prediction.implicit_signals.filter((s: any) => s.signal_type === 'implicit');
              const contextual = transcript.prediction.implicit_signals.filter((s: any) => s.signal_type === 'contextual');
              const biasLanguage = transcript.prediction.implicit_signals.filter((s: any) => s.signal_type === 'bias_language');

              return (
                <>
                  {/* Implicit Signals */}
                  {implicit.length > 0 && (
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">Implicit Signals</h3>
                        <Badge variant="secondary">{implicit.length}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Maintaining innocence despite negative outcomes
                      </p>
                      {implicit.map((signal: any, idx: number) => (
                        <Card key={idx} className="border-orange-500/30 bg-orange-500/5 p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="text-sm mb-2 leading-relaxed">{signal.text}</p>
                              {signal.explanation && (
                                <p className="text-xs text-muted-foreground italic">{signal.explanation}</p>
                              )}
                            </div>
                            {signal.confidence && (
                              <Badge variant="outline" className="shrink-0">
                                {(signal.confidence * 100).toFixed(0)}%
                              </Badge>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Contextual Signals */}
                  {contextual.length > 0 && (
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">Contextual Signals</h3>
                        <Badge variant="secondary">{contextual.length}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Evidence gaps, coerced confessions, or problematic case circumstances
                      </p>
                      {contextual.map((signal: any, idx: number) => (
                        <Card key={idx} className="border-yellow-500/30 bg-yellow-500/5 p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="text-sm mb-2 leading-relaxed">{signal.text}</p>
                              {signal.explanation && (
                                <p className="text-xs text-muted-foreground italic">{signal.explanation}</p>
                              )}
                            </div>
                            {signal.confidence && (
                              <Badge variant="outline" className="shrink-0">
                                {(signal.confidence * 100).toFixed(0)}%
                              </Badge>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Bias Language */}
                  {biasLanguage.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">Bias Language Detected</h3>
                        <Badge variant="secondary">{biasLanguage.length}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Institutional language suggesting bias against maintaining innocence
                      </p>
                      {biasLanguage.map((signal: any, idx: number) => (
                        <Card key={idx} className="border-blue-500/30 bg-blue-500/5 p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="text-sm mb-2 leading-relaxed">{signal.text}</p>
                              {signal.explanation && (
                                <p className="text-xs text-muted-foreground italic">{signal.explanation}</p>
                              )}
                            </div>
                            {signal.confidence && (
                              <Badge variant="outline" className="shrink-0">
                                {(signal.confidence * 100).toFixed(0)}%
                              </Badge>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}

            {/* Show message if no signals detected */}
            {(!transcript.prediction.explicit_claims || transcript.prediction.explicit_claims.length === 0) &&
             (!transcript.prediction.implicit_signals || transcript.prediction.implicit_signals.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No innocence signals detected in this transcript.</p>
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

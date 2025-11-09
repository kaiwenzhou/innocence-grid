import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useParams, useNavigate } from "react-router-dom";
import { Transcript } from "@/lib/types";
import { TranscriptService } from "@/services/transcripts";
import { InnocenceDetectorService } from "@/services/innocenceDetector";
import { ArrowLeft, AlertTriangle, Calendar, User, FileText, Sparkles, Download, ExternalLink, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState, useMemo } from "react";
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

  // Format transcript text into clean, readable format with speaker labels
  const formatTranscriptText = (text: string) => {
    if (!text) return [];
    
    const lines = text.split('\n');
    const formatted: Array<{ speaker: string; text: string; lineNumber: number }> = [];
    let currentSpeaker = '';
    let currentText = '';
    let lineNumber = 0;
    
    lines.forEach((line, idx) => {
      lineNumber = idx + 1;
      const trimmed = line.trim();
      
      // Detect speaker labels (e.g., "COMMISSIONER SHEFFIELD:", "ATTORNEY UKAH:")
      const speakerMatch = trimmed.match(/^([A-Z][A-Z\s]+(?:COMMISSIONER|ATTORNEY|PRESIDING|DEPUTY|INMATE|APPLICANT|MR\.|MS\.|DR\.)[A-Z\s]*?):\s*(.*)$/i);
      
      if (speakerMatch) {
        // Save previous speaker's text
        if (currentSpeaker && currentText.trim()) {
          formatted.push({ speaker: currentSpeaker, text: currentText.trim(), lineNumber: lineNumber - 1 });
        }
        
        // Start new speaker
        currentSpeaker = speakerMatch[1].trim();
        currentText = speakerMatch[2];
      } else if (currentSpeaker && trimmed) {
        // Continue current speaker's text
        currentText += ' ' + trimmed;
      } else if (!currentSpeaker && trimmed) {
        // Text without speaker (header info, etc.)
        formatted.push({ speaker: '', text: trimmed, lineNumber });
      }
    });
    
    // Add last speaker
    if (currentSpeaker && currentText.trim()) {
      formatted.push({ speaker: currentSpeaker, text: currentText.trim(), lineNumber });
    }
    
    return formatted;
  };

  // Find line number where text appears in transcript
  const findLineNumber = (searchText: string, rawText: string): number => {
    if (!searchText || !rawText) return 0;
    
    const lines = rawText.split('\n');
    const searchLower = searchText.toLowerCase().substring(0, 50); // Use first 50 chars for matching
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes(searchLower)) {
        return i + 1;
      }
    }
    return 0;
  };

  // Estimate page number (assuming ~50 lines per page)
  const estimatePageNumber = (lineNumber: number): number => {
    return Math.ceil(lineNumber / 50);
  };

  const formattedTranscript = useMemo(() => {
    return transcript ? formatTranscriptText(transcript.raw_text) : [];
  }, [transcript]);

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
          <div className="mt-4 flex items-center gap-4 flex-wrap">
            <Badge variant={transcript.processed ? "default" : "secondary"}>
              {transcript.processed ? "Processed" : "Pending Analysis"}
            </Badge>
            
            {/* PDF Download Button */}
            {transcript.file_name && transcript.file_name.endsWith('.pdf') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.info("PDF download feature coming soon - original file available in storage")}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Original PDF
              </Button>
            )}
            
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
                {transcript.prediction.explicit_claims.map((claim: any, idx: number) => {
                  const claimText = claim.text || JSON.stringify(claim);
                  const lineNum = findLineNumber(claimText, transcript.raw_text);
                  const pageNum = estimatePageNumber(lineNum);
                  
                  return (
                    <Card key={idx} className="border-accent/30 bg-accent/5 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-sm mb-2">{claimText}</p>
                          {lineNum > 0 && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                              <MapPin className="h-3 w-3" />
                              Found at Line {lineNum}, Page ~{pageNum}
                            </p>
                          )}
                        </div>
                        {claim.confidence && (
                          <Badge variant="outline">
                            {(claim.confidence * 100).toFixed(0)}% confidence
                          </Badge>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Implicit Signals */}
            {transcript.prediction.implicit_signals && transcript.prediction.implicit_signals.length > 0 && (
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-semibold">Implicit Signals</h3>
                {transcript.prediction.implicit_signals.map((signal: any, idx: number) => {
                  const signalText = signal.text || JSON.stringify(signal);
                  const lineNum = findLineNumber(signalText, transcript.raw_text);
                  const pageNum = estimatePageNumber(lineNum);
                  
                  return (
                    <Card key={idx} className="border-border bg-card/50 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <p className="text-sm flex-1">{signalText}</p>
                        {lineNum > 0 && (
                          <Badge variant="outline" className="flex items-center gap-1 shrink-0">
                            <MapPin className="h-3 w-3" />
                            Line {lineNum}, Page ~{pageNum}
                          </Badge>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Contextual Signals */}
            {transcript.prediction.contextual_signals && transcript.prediction.contextual_signals.length > 0 && (
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-semibold">Contextual Signals</h3>
                {transcript.prediction.contextual_signals.map((signal: any, idx: number) => {
                  const signalText = signal.text || JSON.stringify(signal);
                  const lineNum = findLineNumber(signalText, transcript.raw_text);
                  const pageNum = estimatePageNumber(lineNum);
                  
                  return (
                    <Card key={idx} className="border-primary/30 bg-primary/5 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <p className="text-sm flex-1">{signalText}</p>
                        {lineNum > 0 && (
                          <Badge variant="outline" className="flex items-center gap-1 shrink-0">
                            <MapPin className="h-3 w-3" />
                            Line {lineNum}, Page ~{pageNum}
                          </Badge>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Bias Language */}
            {transcript.prediction.bias_language && transcript.prediction.bias_language.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Bias Language Detected</h3>
                {transcript.prediction.bias_language.map((signal: any, idx: number) => {
                  const signalText = signal.text || JSON.stringify(signal);
                  const lineNum = findLineNumber(signalText, transcript.raw_text);
                  const pageNum = estimatePageNumber(lineNum);
                  
                  return (
                    <Card key={idx} className="border-warning/30 bg-warning/5 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <p className="text-sm flex-1">{signalText}</p>
                        {lineNum > 0 && (
                          <Badge variant="outline" className="flex items-center gap-1 shrink-0">
                            <MapPin className="h-3 w-3" />
                            Line {lineNum}, Page ~{pageNum}
                          </Badge>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </Card>
        )}

        {/* Full Transcript Card - Clean Formatted Version */}
        <Card className="border-border bg-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Full Transcript</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const element = document.createElement('a');
                const file = new Blob([transcript.raw_text], { type: 'text/plain' });
                element.href = URL.createObjectURL(file);
                element.download = `${transcript.file_name || 'transcript'}.txt`;
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Export as Text
            </Button>
          </div>
          
          <div className="space-y-4 max-h-[800px] overflow-y-auto">
            {formattedTranscript.map((section, idx) => (
              <div key={idx} className="border-l-2 border-primary/30 pl-4 py-2">
                {section.speaker && (
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-bold text-primary text-sm uppercase">
                      {section.speaker}:
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Line {section.lineNumber}
                    </span>
                  </div>
                )}
                <p className="text-sm leading-relaxed text-foreground/90">
                  {section.text}
                </p>
              </div>
            ))}
          </div>
          
          <Separator className="my-6" />
          
          <div className="bg-muted/30 p-4 rounded-lg">
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Original transcript has been formatted for readability. Speaker labels and content are preserved from the source document.
            </p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TranscriptDetail;

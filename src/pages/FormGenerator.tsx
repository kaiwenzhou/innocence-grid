import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TranscriptService } from "@/services/transcripts";
import { VolunteerService } from "@/services/volunteers";
import { FormProcessor, ClientFormData } from "@/services/formProcessor";
import { Transcript, Volunteer } from "@/lib/types";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useVolunteer } from "@/context/VolunteerContext";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  FileText, 
  Download,
  CheckCircle2,
  AlertTriangle,
  Copy,
  ExternalLink
} from "lucide-react";

const FormGenerator = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentVolunteer, isAuthenticated } = useVolunteer();
  
  const [assignedCases, setAssignedCases] = useState<Transcript[]>([]);
  const [selectedTranscriptId, setSelectedTranscriptId] = useState<string>("");
  const [formData, setFormData] = useState<ClientFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated && currentVolunteer) {
      loadAssignedCases();
    }
  }, [isAuthenticated, currentVolunteer]);

  const loadAssignedCases = async () => {
    try {
      setIsLoading(true);
      const allTranscripts = await TranscriptService.getAllTranscripts();
      const myCases = allTranscripts.filter(
        t => t.assigned_to === currentVolunteer?.id
      );
      setAssignedCases(myCases);
    } catch (error) {
      toast({
        title: "Error loading cases",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessTranscript = async () => {
    if (!selectedTranscriptId) return;
    
    try {
      setIsProcessing(true);
      const transcript = assignedCases.find(t => t.id === selectedTranscriptId);
      
      if (!transcript) {
        throw new Error("Transcript not found");
      }
      
      const processedData = FormProcessor.processTranscriptForForm(transcript);
      setFormData(processedData);
      
      toast({
        title: "Form data processed",
        description: "Client intake form has been auto-filled from transcript",
      });
    } catch (error) {
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!formData) return;
    
    const pdfText = FormProcessor.generatePDFData(formData);
    const blob = new Blob([pdfText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `intake-form-${formData.cdcrNumber}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Form downloaded",
      description: "Client intake form has been downloaded",
    });
  };

  const handleCopyToClipboard = () => {
    if (!formData) return;
    
    const formText = FormProcessor.generatePDFData(formData);
    navigator.clipboard.writeText(formText);
    
    toast({
      title: "Copied to clipboard",
      description: "Form data has been copied",
    });
  };

  const validation = formData ? FormProcessor.validateFormData(formData) : null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-sm">
            Client Intake Form Generator
          </h1>
          <p className="text-slate-200 mt-2 font-medium">
            Auto-fill client forms from parole hearing transcripts
          </p>
        </div>

        {/* Info Banner */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900">Automated Form Processing</h3>
              <p className="text-sm text-blue-800 mt-1">
                Select a case assigned to you, and we'll automatically extract information from the 
                transcript to fill out the client intake form. Review and download as needed.
              </p>
            </div>
          </div>
        </Card>

        {/* Case Selection */}
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="case-select" className="text-foreground font-semibold">
                Select Assigned Case
              </Label>
              <Select 
                value={selectedTranscriptId} 
                onValueChange={setSelectedTranscriptId}
              >
                <SelectTrigger id="case-select" className="w-full mt-2">
                  <SelectValue placeholder="Choose a case to process..." />
                </SelectTrigger>
                <SelectContent>
                  {assignedCases.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No cases assigned to you
                    </SelectItem>
                  ) : (
                    assignedCases.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.inmate_name || "Unknown"} - {t.cdcr_number || "No CDCR"}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleProcessTranscript}
              disabled={!selectedTranscriptId || isProcessing}
              className="w-full"
            >
              {isProcessing ? "Processing..." : "Generate Form Data"}
            </Button>
          </div>
        </Card>

        {/* Form Preview */}
        {formData && (
          <>
            {/* Validation Status */}
            {validation && (
              <Card className="p-4">
                <div className="space-y-3">
                  {validation.isComplete ? (
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-semibold">Form data complete</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-rose-700">
                      <AlertTriangle className="h-5 w-5" />
                      <span className="font-semibold">
                        Missing fields: {validation.missingFields.join(", ")}
                      </span>
                    </div>
                  )}
                  
                  {validation.warnings.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-sm text-amber-700 font-medium">⚠️ Warnings:</p>
                      {validation.warnings.map((warning, idx) => (
                        <p key={idx} className="text-sm text-amber-600">• {warning}</p>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Form Data Display */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <Card className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">Personal Information</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm text-muted-foreground">Full Name</Label>
                    <p className="font-medium text-foreground">{formData.fullName}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">CDCR Number</Label>
                    <p className="font-medium text-foreground">{formData.cdcrNumber}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Facility</Label>
                    <p className="font-medium text-foreground">{formData.facilityName}</p>
                  </div>
                </div>
              </Card>

              {/* Case Information */}
              <Card className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">Case Information</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm text-muted-foreground">Hearing Date</Label>
                    <p className="font-medium text-foreground">{formData.hearingDate}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Sentence</Label>
                    <p className="font-medium text-foreground">{formData.sentenceLength}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Conviction</Label>
                    <p className="text-sm text-foreground">{formData.convictionDetails}</p>
                  </div>
                </div>
              </Card>

              {/* Innocence Claim */}
              <Card className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">Innocence Claim</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm text-muted-foreground">Has Claim</Label>
                    <Badge variant={formData.hasInnocenceClaim ? "default" : "outline"}>
                      {formData.hasInnocenceClaim ? "YES" : "NO"}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Statement</Label>
                    <p className="text-sm text-foreground">{formData.innocenceStatement}</p>
                  </div>
                </div>
              </Card>

              {/* Panel Information */}
              <Card className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">Hearing Panel</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm text-muted-foreground">Commissioners</Label>
                    {formData.commissioners.map((comm, idx) => (
                      <Badge key={idx} variant="outline" className="mr-2 mb-2">
                        {comm}
                      </Badge>
                    ))}
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Composition</Label>
                    <p className="text-sm text-foreground">{formData.panelComposition}</p>
                  </div>
                </div>
              </Card>

              {/* Programs */}
              <Card className="p-6 lg:col-span-2">
                <h3 className="text-lg font-bold text-foreground mb-4">Rehabilitation Programs</h3>
                <div className="flex flex-wrap gap-2">
                  {formData.programsCompleted.length > 0 ? (
                    formData.programsCompleted.map((program, idx) => (
                      <Badge key={idx} variant="outline" className="bg-green-50 text-green-700">
                        {program}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No programs identified</p>
                  )}
                </div>
              </Card>
            </div>

            {/* Actions */}
            <Card className="p-6">
              <div className="flex flex-wrap gap-4">
                <Button onClick={handleDownloadPDF} className="gap-2">
                  <Download className="h-4 w-4" />
                  Download Form
                </Button>
                <Button onClick={handleCopyToClipboard} variant="outline" className="gap-2">
                  <Copy className="h-4 w-4" />
                  Copy to Clipboard
                </Button>
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => window.open("https://app.lawmatics.com/forms/share/c024910d-07d7-440d-985b-6e0a515ccce2", "_blank")}
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Original Form
                </Button>
              </div>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FormGenerator;


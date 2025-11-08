import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Upload as UploadIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { TranscriptService } from "@/services/transcripts";

const Upload = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFiles = (files: FileList) => {
    const file = files[0];
    // Accept text files and PDF files
    const isValidType = file.type === "text/plain" || file.type === "application/pdf";

    if (file && isValidType) {
      uploadFile(file);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a text (.txt) or PDF file",
        variant: "destructive",
      });
    }
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setProgress(0);

    try {
      const result = await TranscriptService.uploadTranscript(file, (progress) => {
        setProgress(progress);
      });

      if (result.success) {
        toast({
          title: "Upload successful",
          description: `${file.name} has been uploaded`,
        });
        navigate("/transcripts");
      } else {
        toast({
          title: "Upload failed",
          description: result.error || "An error occurred during upload",
          variant: "destructive",
        });
        setIsUploading(false);
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An error occurred during upload",
        variant: "destructive",
      });
      setIsUploading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Upload Transcript</h1>
          <p className="text-muted-foreground">Upload court transcripts for analysis</p>
        </div>

        <Card className="border-border bg-card p-8">
          <div
            className={`relative rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".txt,.pdf"
              className="absolute inset-0 cursor-pointer opacity-0"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
              disabled={isUploading}
            />
            
            <UploadIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">
              {isUploading ? "Uploading..." : "Drop your transcript here"}
            </h3>
            <p className="text-sm text-muted-foreground">
              or click to browse files (.txt or .pdf)
            </p>

            {isUploading && (
              <div className="mt-6 space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-muted-foreground">{progress}% complete</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Upload;

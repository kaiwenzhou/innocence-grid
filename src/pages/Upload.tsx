import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Upload as UploadIcon, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { TranscriptService } from "@/services/transcripts";

interface FileUploadStatus {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

const Upload = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatuses, setUploadStatuses] = useState<FileUploadStatus[]>([]);
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
    const fileArray = Array.from(files);

    // Validate all files
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    fileArray.forEach(file => {
      const isValidType =
        file.type === "text/plain" ||
        file.type === "application/pdf" ||
        file.name.endsWith('.txt') ||
        file.name.endsWith('.pdf');

      if (isValidType) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file.name);
      }
    });

    if (invalidFiles.length > 0) {
      toast({
        title: "Some files were skipped",
        description: `Invalid file type(s): ${invalidFiles.join(', ')}. Only .txt and .pdf files are supported.`,
        variant: "destructive",
      });
    }

    if (validFiles.length > 0) {
      uploadFiles(validFiles);
    }
  };

  const uploadFiles = async (files: File[]) => {
    setIsUploading(true);

    // Initialize upload statuses
    const initialStatuses: FileUploadStatus[] = files.map(file => ({
      file,
      progress: 0,
      status: 'pending' as const,
    }));
    setUploadStatuses(initialStatuses);

    let successCount = 0;
    let errorCount = 0;

    // Upload files sequentially
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Update status to uploading
      setUploadStatuses(prev =>
        prev.map((status, idx) =>
          idx === i ? { ...status, status: 'uploading' as const } : status
        )
      );

      try {
        const result = await TranscriptService.uploadTranscript(file, (progress) => {
          setUploadStatuses(prev =>
            prev.map((status, idx) =>
              idx === i ? { ...status, progress } : status
            )
          );
        });

        if (result.success) {
          successCount++;
          setUploadStatuses(prev =>
            prev.map((status, idx) =>
              idx === i ? { ...status, status: 'success' as const, progress: 100 } : status
            )
          );
        } else {
          errorCount++;
          setUploadStatuses(prev =>
            prev.map((status, idx) =>
              idx === i
                ? { ...status, status: 'error' as const, error: result.error || 'Upload failed' }
                : status
            )
          );
        }
      } catch (error) {
        errorCount++;
        setUploadStatuses(prev =>
          prev.map((status, idx) =>
            idx === i
              ? {
                  ...status,
                  status: 'error' as const,
                  error: error instanceof Error ? error.message : 'An error occurred during upload'
                }
              : status
          )
        );
      }
    }

    setIsUploading(false);

    // Show summary toast
    if (successCount === files.length) {
      toast({
        title: "All files uploaded successfully",
        description: `${successCount} transcript(s) uploaded`,
      });
      // Navigate after a short delay to let users see the final status
      setTimeout(() => navigate("/transcripts"), 1500);
    } else if (successCount > 0) {
      toast({
        title: "Upload partially complete",
        description: `${successCount} succeeded, ${errorCount} failed`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Upload failed",
        description: "All uploads failed",
        variant: "destructive",
      });
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
              multiple
              className="absolute inset-0 cursor-pointer opacity-0"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
              disabled={isUploading}
            />

            <UploadIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">
              {isUploading ? "Uploading..." : "Drop your transcripts here"}
            </h3>
            <p className="text-sm text-muted-foreground">
              or click to browse files (.txt or .pdf) - multiple files supported
            </p>

            {uploadStatuses.length > 0 && (
              <div className="mt-6 space-y-3 text-left">
                {uploadStatuses.map((status, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {status.status === 'success' && (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                        {status.status === 'error' && (
                          <XCircle className="h-4 w-4 text-destructive" />
                        )}
                        <span className="text-sm font-medium truncate max-w-[300px]">
                          {status.file.name}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {status.status === 'pending' && 'Waiting...'}
                        {status.status === 'uploading' && `${status.progress}%`}
                        {status.status === 'success' && 'Complete'}
                        {status.status === 'error' && 'Failed'}
                      </span>
                    </div>
                    {status.status === 'uploading' && (
                      <Progress value={status.progress} className="w-full" />
                    )}
                    {status.status === 'error' && status.error && (
                      <p className="text-xs text-destructive">{status.error}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Upload;

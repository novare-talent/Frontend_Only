import React, { useState, useRef, DragEvent, ChangeEvent } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Trash2, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Resume {
  name: string;
  url: string;
  uploadedAt: string;
}

interface ProfileData {
  id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  resume_url?: string[];
}

interface ResumeManagerProps {
  profileData?: ProfileData;
  onResumeUpdate: (resumeUrls: string[]) => void;
  userId?: string;
}

// Helper function to extract file name from URL
const extractFileNameFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    return pathname.split("/").pop() || "Resume.pdf";
  } catch {
    return url.split("/").pop() || "Resume.pdf";
  }
};

// Helper function to extract date from URL if possible
const extractDateFromUrl = (url: string): string | null => {
  const match = url.match(/\d{13}/); // Look for timestamp in URL
  if (match) {
    try {
      const timestamp = parseInt(match[0]);
      return new Date(timestamp).toISOString();
    } catch {
      return null;
    }
  }
  return null;
};

const ResumeManager: React.FC<ResumeManagerProps> = ({
  profileData,
  onResumeUpdate,
  userId,
}) => {
  const [resumes, setResumes] = useState<Resume[]>(() => {
    if (!profileData?.resume_url) return [];

    return profileData.resume_url.map((url) => ({
      name: extractFileNameFromUrl(url),
      url,
      uploadedAt: extractDateFromUrl(url) || new Date().toISOString(),
    }));
  });

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (
    e: ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFiles(files);
      // Reset the file input
      e.target.value = "";
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>): Promise<void> => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await processFiles(files);
    }
  };

  const processFiles = async (files: FileList): Promise<void> => {
    setUploading(true);

    // File validation
    const validFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Check file type
      const validTypes = [
        "application/pdf",
      ];
      const validExtensions = [".pdf"];
      const fileExtension = file.name
        .substring(file.name.lastIndexOf("."))
        .toLowerCase();

      if (
        !validTypes.includes(file.type) &&
        !validExtensions.includes(fileExtension)
      ) {
        toast.error("PDF Only", { description: "Please upload only PDF files" });
        continue;
      }

      // Check file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Size Limit", { description: "File size exceeds 2MB limit" });
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) {
      setUploading(false);
      return;
    }

    try {
      // Upload files to Supabase storage
      const { createClient } = await import("@/utils/supabase/client");
      const supabase = createClient();

      const newResumeUrls: string[] = [];

      for (const file of validFiles) {
        const filePath = `${userId}/${Date.now()}_${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from("resumes")
          .upload(filePath, file, { upsert: true });

        if (uploadError) {
          console.error("Resume upload error:", uploadError.message);
          continue;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("resumes").getPublicUrl(filePath);

        newResumeUrls.push(publicUrl);

        // Add to local state for immediate UI update
        setResumes((prev) => [
          ...prev,
          {
            name: file.name,
            url: publicUrl,
            uploadedAt: new Date().toISOString(),
          },
        ]);
      }

      // Update parent component with all resume URLs
      const allUrls = [...resumes.map((r) => r.url), ...newResumeUrls];
      onResumeUpdate(allUrls);
    } catch (error) {
      toast.error("Error", { description: "Error uploading resumes. Please try again." });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (index: number): Promise<void> => {
  const resumeToDelete = resumes[index];

  // Show confirmation dialog
  if (
    !window.confirm(
      `Are you sure you want to delete "${resumeToDelete.name}"?`
    )
  ) {
    return;
  }

  try {
    const { createClient } = await import("@/utils/supabase/client");
    const supabase = createClient();

    // Extract the correct file path from the URL
    const url = new URL(resumeToDelete.url);
    const pathname = url.pathname;
    
    // For Supabase storage URLs, the pathname includes the bucket name
    // Example: "/storage/v1/object/public/resumes/user-id/filename.pdf"
    const pathParts = pathname.split('/');
    
    // Find the index of the bucket name in the path
    const bucketIndex = pathParts.indexOf('resumes');
    
    if (bucketIndex !== -1) {
      // Get all parts after the bucket name - this is the file path
      const filePath = pathParts.slice(bucketIndex + 1).join('/');
      
      const { error } = await supabase.storage
        .from('resumes')
        .remove([filePath]);

      if (error) {
        toast.error("Error", { description: "Failed to delete file from storage. Please try again." });
        return;
      }
    } else {
      toast.error("Error", { description: "Failed to delete file. Invalid URL format."});
      return;
    }

    // Update local state
    const newResumes = [...resumes];
    newResumes.splice(index, 1);
    setResumes(newResumes);

    // Update parent component
    onResumeUpdate(newResumes.map((r) => r.url));
    
  } catch (error) {
    toast.error("Error", { description: "Error deleting resume. Please try again."});
  }
};

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleUploadAreaClick = (): void => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Function to view resume (opens in new tab)
  const viewResume = (url: string): void => {
    window.open(url, "_blank");
  };

  return (
    <Card className="w-full gap-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Upload Resume
        </CardTitle>
        <CardDescription>
          Keep your resume updated to streamline job applications.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 mt-0 pt-0">
        {resumes.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No resumes uploaded yet.
          </p>
        ) : (
          <div className="space-y-3">
            {resumes.map((resume, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg bg-card"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <Button
                      variant="link"
                      className="p-0 h-auto font-normal text-left justify-start block truncate max-w-80"
                      onClick={() => viewResume(resume.url)}
                      title={resume.name}
                    >
                      {resume.name}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Uploaded on {formatDate(resume.uploadedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => viewResume(resume.url)}
                    className="h-8 w-8"
                    title="View resume"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(index)}
                    disabled={uploading}
                    className="h-8 w-8"
                    title="Delete resume"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {resumes.length < 3 && (
          <div
            className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary hover:bg-primary/5"
            } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={uploading ? undefined : handleUploadAreaClick}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf"
              className="hidden"
              multiple
              disabled={uploading}
            />

            {uploading ? (
              <div className="flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm font-medium">Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    Click to upload or drag & drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDF (up to 2MB)
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  Supported formats
                </Badge>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResumeManager;

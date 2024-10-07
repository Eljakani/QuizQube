import React, { useState, useCallback, useRef } from 'react';
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader, Upload } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface FileUploaderProps {
  onUploadComplete: (fileUrl: string, fileName: string, fileSize: number) => void;
  isUploading: boolean;
  setIsUploading: (isUploading: boolean) => void;
  fileCount: number;
}

export default function FileUploader({ onUploadComplete, isUploading, setIsUploading, fileCount }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please select a PDF file.",
        variant: "destructive",
      });
    }
  };

  const uploadFileToS3 = useCallback(async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Get the pre-signed URL from your API
      const response = await fetch('/api/getPresignedUrl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, fileType: file.type }),
      });

      if (!response.ok) throw new Error('Failed to get pre-signed URL');

      const { uploadUrl, key } = await response.json();

      // Upload the file using the pre-signed URL
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setUploadProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const fileUrl = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${key}`;
          setIsUploading(false);
          onUploadComplete(fileUrl, file.name, file.size);
          setFile(null);
          setUploadProgress(0);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          toast({
            title: "Upload successful",
            description: "Your file has been uploaded successfully.",
            variant: "default",
          });
        } else {
          throw new Error('Upload failed');
        }
      };

      xhr.onerror = () => {
        throw new Error('Upload failed');
      };

      xhr.send(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      setIsUploading(false);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file. Please try again.",
        variant: "destructive",
      });
    }
  }, [file, onUploadComplete, setIsUploading, toast]);

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 justify-center">
        <Input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          disabled={isUploading || fileCount >= 5}
          className="file:mr-4 h-12 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-main file:text-primary-foreground hover:file:bg-primary/90"
          ref={fileInputRef}
        />
        <Button
          onClick={uploadFileToS3}
          disabled={!file || isUploading || fileCount >= 5}
          className="whitespace-nowrap bg-main"
        >
          {isUploading ? (
            <Loader className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          {isUploading ? 'Uploading...' : 'Upload'}
        </Button>
      </div>
      {isUploading && (
        <div className="space-y-2">
          <Progress value={uploadProgress} className="w-full" />
          <p className="text-sm text-muted-foreground text-center">
            {uploadProgress.toFixed(0)}% uploaded
          </p>
        </div>
      )}
    </div>
  );
}
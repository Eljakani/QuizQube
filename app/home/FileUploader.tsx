import React, { useState, useRef } from 'react';
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from 'framer-motion';
import { useFileUpload } from './FileUploadContext';

interface FileUploaderProps {
  onUploadComplete: (fileUrl: string, fileName: string, fileSize: number) => void;
}

interface FileStatus {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  url?: string;
}

export default function FileUploader({ onUploadComplete }: FileUploaderProps) {
  const [fileStatuses, setFileStatuses] = useState<FileStatus[]>([]);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addFile, removeFile, files } = useFileUpload();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    const validFiles = selectedFiles.filter(file => file.type === "application/pdf");
    
    // Calculate how many more files we can add
    const remainingSlots = 3 - files.length;
    
    // Slice the valid files to only take up to the remaining slots
    const filesToAdd = validFiles.slice(0, remainingSlots);

    const newFiles = filesToAdd.map(file => ({ file, progress: 0, status: 'pending' as const }));

    if (validFiles.length !== selectedFiles.length) {
      toast({
        title: "Invalid file type",
        description: "Only PDF files are allowed.",
        variant: "destructive",
      });
    }

    if (selectedFiles.length > remainingSlots) {
      toast({
        title: "File limit reached",
        description: `Only ${remainingSlots} more file(s) can be added. The first ${remainingSlots} valid PDF(s) were selected.`,
        variant: "destructive",
      });
    }

    setFileStatuses(prevFiles => [...prevFiles, ...newFiles]);
    newFiles.forEach(fileStatus => uploadFile(fileStatus));
  };

  const uploadFile = async (fileStatus: FileStatus) => {
    setFileStatuses(prevFiles => 
      prevFiles.map(f => f.file === fileStatus.file ? { ...f, status: 'uploading' } : f)
    );

    try {
      const response = await fetch('/api/getPresignedUrl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: fileStatus.file.name, fileType: fileStatus.file.type }),
      });

      if (!response.ok) throw new Error('Failed to get pre-signed URL');

      const { uploadUrl, key } = await response.json();

      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', fileStatus.file.type);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setFileStatuses(prevFiles => prevFiles.map(f => 
            f.file === fileStatus.file ? { ...f, progress: percentComplete } : f
          ));
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const fileUrl = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${key}`;
          setFileStatuses(prevFiles => prevFiles.map(f => 
            f.file === fileStatus.file ? { ...f, status: 'completed', url: fileUrl, progress: 100 } : f
          ));
          addFile({ url: fileUrl, name: fileStatus.file.name, size: fileStatus.file.size });
          onUploadComplete(fileUrl, fileStatus.file.name, fileStatus.file.size);
          toast({
            title: "Upload successful",
            description: `${fileStatus.file.name} has been uploaded successfully.`,
            variant: "default",
          });
        } else {
          throw new Error('Upload failed');
        }
      };

      xhr.onerror = () => {
        throw new Error('Upload failed');
      };

      xhr.send(fileStatus.file);
    } catch (error) {
      console.error('Error uploading file:', error);
      setFileStatuses(prevFiles => prevFiles.map(f => 
        f.file === fileStatus.file ? { ...f, status: 'error' } : f
      ));
      toast({
        title: "Upload failed",
        description: `There was an error uploading ${fileStatus.file.name}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handleRemoveFile = (fileToRemove: FileStatus) => {
    setFileStatuses(prevFiles => prevFiles.filter(f => f !== fileToRemove));
    if (fileToRemove.status === 'completed' && fileToRemove.url) {
      removeFile(fileToRemove.file.name);
    }
  };

  return (
    <div className="space-y-4">
      <div
        className="flex flex-col items-center justify-center space-y-2 p-4 border-2 border-dashed border-primary/50 rounded-lg bg-background/50 cursor-pointer hover:bg-background/80 transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-8 h-8 text-primary" />
        <p className="text-center text-sm text-muted-foreground">
          Drag & drop your PDFs here or <span className="text-primary font-semibold">click to browse</span>
        </p>
        <p className="text-xs text-muted-foreground">
          You can select up to {3 - files.length} more files
        </p>
        <Input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          multiple
          disabled={files.length >= 3}
          className="hidden"
          ref={fileInputRef}
        />
      </div>
      
      <div className="space-y-2">
        <AnimatePresence>
          {fileStatuses.map((fileStatus) => (
            <motion.div
              key={fileStatus.file.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-between p-2 bg-card rounded-lg border-primary/10 border"
            >
              <div className="flex items-center space-x-2 flex-1 min-w-0 gap-1 mx-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-5 h-5 flex-shrink-0 text-primary" ><path d="M0 64C0 28.7 28.7 0 64 0L224 0l0 128c0 17.7 14.3 32 32 32l128 0 0 144-208 0c-35.3 0-64 28.7-64 64l0 144-48 0c-35.3 0-64-28.7-64-64L0 64zm384 64l-128 0L256 0 384 128zM176 352l32 0c30.9 0 56 25.1 56 56s-25.1 56-56 56l-16 0 0 32c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-48 0-80c0-8.8 7.2-16 16-16zm32 80c13.3 0 24-10.7 24-24s-10.7-24-24-24l-16 0 0 48 16 0zm96-80l32 0c26.5 0 48 21.5 48 48l0 64c0 26.5-21.5 48-48 48l-32 0c-8.8 0-16-7.2-16-16l0-128c0-8.8 7.2-16 16-16zm32 128c8.8 0 16-7.2 16-16l0-64c0-8.8-7.2-16-16-16l-16 0 0 96 16 0zm80-112c0-8.8 7.2-16 16-16l48 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-32 0 0 32 32 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-32 0 0 48c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-64 0-64z"/></svg>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{fileStatus.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(fileStatus.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {fileStatus.status === 'uploading' && (
                  <div className="w-24">
                    <Progress value={fileStatus.progress} className="h-1" />
                  </div>
                )}
                {fileStatus.status === 'completed' && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
                {fileStatus.status === 'error' && (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleRemoveFile(fileStatus)}
                  disabled={fileStatus.status === 'uploading'}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
'use client';
import React, { createContext, useContext, useState, useCallback } from 'react';

interface UploadedFile {
  url: string;
  name: string;
  size: number;
}

interface FileUploadContextType {
  files: UploadedFile[];
  addFile: (file: UploadedFile) => void;
  removeFile: (fileName: string) => void;
  clearFiles: () => void;
}

const FileUploadContext = createContext<FileUploadContextType | undefined>(undefined);

export const FileUploadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const addFile = useCallback((file: UploadedFile) => {
    setFiles(prevFiles => [...prevFiles, file]);
  }, []);

  const removeFile = useCallback((fileName: string) => {
    setFiles(prevFiles => prevFiles.filter(file => file.name !== fileName));
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  return (
    <FileUploadContext.Provider value={{ files, addFile, removeFile, clearFiles }}>
      {children}
    </FileUploadContext.Provider>
  );
};

export const useFileUpload = () => {
  const context = useContext(FileUploadContext);
  if (context === undefined) {
    throw new Error('useFileUpload must be used within a FileUploadProvider');
  }
  return context;
};
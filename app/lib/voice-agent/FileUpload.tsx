
// lib/voice-agent/FileUpload.tsx (UI component for file uploads)
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Upload, X, FileText } from "lucide-react";

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  loading?: boolean;
}

export function FileUpload({
  onFilesSelected,
  accept = ".pdf,.docx",
  multiple = false,
  loading = false
}: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setSelectedFiles(prev => (multiple ? [...prev, ...fileArray] : fileArray));
      onFilesSelected(multiple ? [...selectedFiles, ...fileArray] : fileArray);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files) {
      const fileArray = Array.from(files).filter(file => {
        const fileType = file.type;
        return fileType === "application/pdf" || 
          fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      });
      
      if (fileArray.length > 0) {
        setSelectedFiles(prev => (multiple ? [...prev, ...fileArray] : fileArray));
        onFilesSelected(multiple ? [...selectedFiles, ...fileArray] : fileArray);
      }
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          disabled={loading}
        />
        <Upload className="h-12 w-12 text-gray-400 mb-2" />
        <p className="text-sm text-gray-600 text-center">
          Drag & drop files here, or click to select
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Supported formats: PDF, DOCX
        </p>
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Selected files:</p>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 text-blue-500 mr-2" />
                  <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                </div>
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="text-gray-500 hover:text-red-500 transition-colors"
                  disabled={loading}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

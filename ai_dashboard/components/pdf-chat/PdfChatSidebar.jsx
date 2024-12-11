"use client";
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowLeft, 
  Upload, 
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { format } from 'date-fns';
import { FileIcon as ReactFileIcon, defaultStyles } from 'react-file-icon';
import { WorkspaceSwitcher } from "@/components/WorkspaceSwitcher";
import { useWorkspace } from "@/context/workspace-context";
import { createClient } from '@/utils/supabase/client';
import { TokenUsageViewer } from "./TokenUsageViewer";

export function PdfChatSidebar({
  className, 
  files, 
  loadingFiles, 
  selectedFile, 
  onFileSelect, 
  onUpload,
  isUploading,
  uploadProgress,
  tokenRefreshTrigger
}) {
  const router = useRouter();
  const { currentWorkspace } = useWorkspace();
  const [user, setUser] = useState(null);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onUpload,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxSize: 10485760, // 10MB
    multiple: false,
  });

  const getFileIconProps = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    return {
      extension,
      color: 'mistyrose',
      type: 'acrobat',
      fold: true,
      radius: 8,
    };
  };

  const truncateFileName = (fileName, maxLength = 20) => {
    if (fileName.length <= maxLength) return fileName;
    
    const extension = fileName.split('.').pop();
    const nameWithoutExt = fileName.slice(0, -(extension.length + 1));
    
    if (nameWithoutExt.length <= maxLength - 5) return fileName;
    
    return `${nameWithoutExt.slice(0, maxLength - 5)}...${extension}`;
  };

  const renderUploadZone = () => (
    <div
      {...getRootProps()}
      className={cn(
        "mx-3 mb-3 border-2 border-dashed rounded-lg p-4 transition-colors group",
        isDragActive 
          ? "border-primary/50 bg-primary/10" 
          : "border-border/20 hover:border-border/40"
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-2">
        {isUploading ? (
          <>
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground text-center">
              Uploading... {uploadProgress}%
            </p>
          </>
        ) : (
          <>
            <Upload className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
            <p className="text-sm text-muted-foreground text-center group-hover:text-foreground">
              Drop PDF here or click to upload
            </p>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className={cn(
      "border-r border-border bg-secondary/30 text-foreground flex flex-col w-72",
      className
    )}>
      {/* Header */}
      <div className="p-3 flex items-center gap-2 border-b border-border h-14">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => router.push('/')}
          className="mr-1 hover:bg-secondary text-muted-foreground"
        >
          <ArrowLeft size={14} />
        </Button>
        <span className="font-semibold text-sm">Pdf Chat</span>
      </div>

      {/* Workspace Switcher */}
      <div className="p-3">
        <WorkspaceSwitcher isCollapsed={false} />
      </div>
      
      {/* Upload Zone */}
      {renderUploadZone()}

      {/* File List */}
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1.5 pb-3">
          {loadingFiles ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">No files uploaded</p>
            </div>
          ) : (
            files.map((file) => (
              <Button
                key={file.name}
                variant="ghost"
                className={cn(
                  "w-full justify-start text-muted-foreground hover:text-foreground hover:bg-secondary/50 border-l-4 border-transparent",
                  selectedFile?.name === file.name && "bg-secondary/80 border-primary text-foreground"
                )}
                onClick={() => onFileSelect(file)}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="w-6 h-6 flex-shrink-0">
                    <ReactFileIcon
                      {...getFileIconProps(file.originalName)}
                      {...defaultStyles}
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium truncate">
                      {truncateFileName(file.originalName)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(file.created_at), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
              </Button>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Token Usage Viewer */}
      {selectedFile && currentWorkspace && user && (
        <TokenUsageViewer 
          fileId={`${currentWorkspace.id}/${user.id}/${selectedFile.name}`}
          refreshTrigger={tokenRefreshTrigger}
        />
      )}
    </div>
  );
} 
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Upload, Grid, List, Info } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { UploadSidebar } from "@/components/UploadSidebar";

export default function SelectFiles({
  isLoadingFiles,
  files,
  selectedFiles,
  onFileSelect,
  onFilesUpdate
}) {
  const [viewMode, setViewMode] = useState('grid');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const handleUploadSuccess = (newFiles) => {
    setIsUploadOpen(false);
    if (onFilesUpdate) {
      onFilesUpdate(newFiles);
    }
  };

  // Debug helper
  const isFileSelected = (filePath) => {
    return selectedFiles.includes(filePath);
  };

  if (isLoadingFiles) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, index) => (
          <Card key={`skeleton-${index}`} className="p-4">
            <Skeleton className="h-12 w-12 rounded" />
            <div className="mt-4 space-y-2">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-3 w-[100px]" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Upload className="w-6 h-6 text-primary" />
          </div>
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          No files available
        </h3>
        <p className="text-muted-foreground mb-4">
          Upload some files to get started
        </p>
        <Button 
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={() => setIsUploadOpen(true)}
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Files
        </Button>
        <UploadSidebar 
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          onUploadSuccess={handleUploadSuccess}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-medium text-foreground">
            Selected: {selectedFiles.length} files
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'text-primary' : 'text-muted-foreground'}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setViewMode('grid')}
            className={viewMode === 'grid' ? 'text-primary' : 'text-muted-foreground'}
          >
            <Grid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file) => {
            const filePath = file.file_path;
            const isSelected = isFileSelected(filePath);
            
            return (
              <div
                key={filePath}
                className={`relative rounded-lg border p-4 cursor-pointer transition-colors
                  ${isSelected 
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary'
                  }`}
                onClick={() => onFileSelect(filePath)}
              >
                <div className="flex items-center space-x-3">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-foreground truncate">
                      {file.originalName}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(file.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((file) => {
            const filePath = file.file_path;
            const isSelected = isFileSelected(filePath);

            return (
              <div
                key={filePath}
                className={`flex items-center p-4 cursor-pointer transition-colors rounded-lg border
                  ${isSelected
                    ? 'bg-primary/10 border-primary'
                    : 'hover:bg-muted/50 border-border'
                  }`}
                onClick={() => onFileSelect(filePath)}
              >
                <div className="flex items-center flex-1 min-w-0 space-x-3">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-foreground truncate">
                      {file.originalName}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {new Date(file.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <UploadSidebar 
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
} 
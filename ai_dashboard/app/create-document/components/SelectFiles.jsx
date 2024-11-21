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
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
            <Upload className="w-6 h-6 text-purple-600" />
          </div>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No files available
        </h3>
        <p className="text-gray-500 mb-4">
          Upload some files to get started
        </p>
        <Button 
          className="bg-purple-600 hover:bg-purple-700 text-white"
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
      <Card className="p-4 bg-purple-50 border-purple-100">
        <div className="flex gap-3">
          <Info className="h-5 w-5 text-purple-600 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-medium text-purple-900">About File Selection</h3>
            <p className="text-sm text-purple-700">
              The files you select will determine the content of your AI-generated document. 
              Choose files that contain relevant information for your desired output.
            </p>
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-medium text-gray-900">
            Selected: {selectedFiles.length} files
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'text-purple-600' : 'text-gray-600'}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setViewMode('grid')}
            className={viewMode === 'grid' ? 'text-purple-600' : 'text-gray-600'}
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
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-500'
                  }`}
                onClick={() => onFileSelect(filePath)}
              >
                <div className="flex items-center space-x-3">
                  <FileText className="h-6 w-6 text-gray-600" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {file.originalName}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
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
                    ? 'bg-purple-50 border-purple-500'
                    : 'hover:bg-gray-50 border-gray-200'
                  }`}
                onClick={() => onFileSelect(filePath)}
              >
                <div className="flex items-center flex-1 min-w-0 space-x-3">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {file.originalName}
                    </h3>
                    <p className="text-xs text-gray-600">
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
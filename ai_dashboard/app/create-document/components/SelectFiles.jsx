import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Upload } from "lucide-react";
import Link from "next/link";

export default function SelectFiles({
  isLoadingFiles,
  files,
  selectedFiles,
  onFileSelect
}) {
  if (isLoadingFiles) {
    return (
      <div className="space-y-4">
        {Array(3).fill(0).map((_, index) => (
          <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-5 w-5" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-3 w-[100px]" />
            </div>
          </div>
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
        <Link href="/files">
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
            <Upload className="w-4 h-4 mr-2" />
            Upload Files
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {files.map((file) => (
        <div
          key={file.file_path}
          className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50"
        >
          <input
            type="checkbox"
            checked={selectedFiles.includes(file.file_path)}
            onChange={(e) => {
              onFileSelect(file.file_path, e.target.checked);
            }}
            className="h-4 w-4 rounded border-gray-300"
          />
          <FileText className="h-5 w-5 text-gray-400" />
          <div>
            <div className="font-medium">{file.originalName}</div>
            <div className="text-sm text-gray-500">
              {new Date(file.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 
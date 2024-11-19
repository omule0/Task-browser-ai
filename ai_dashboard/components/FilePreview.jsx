"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Trash2, Download, Loader2, ArrowRight, FileText } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { useWorkspace } from '@/context/workspace-context';
import { customToast } from "@/components/ui/toast-theme";
import { Button } from "@/components/ui/button";
import { FileIcon, defaultStyles } from 'react-file-icon';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDistanceToNow } from 'date-fns';

function bytesToSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function FilePreviewSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Skeleton className="w-10 h-10 rounded" />
              <div>
                <Skeleton className="h-4 w-48 mb-2" />
                <div className="flex gap-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="w-8 h-8 rounded-full" />
            </div>
          </div>
        ))}
        <Skeleton className="h-12 w-full rounded-lg" />
      </CardContent>
    </Card>
  );
}

export function FilePreview({ refresh }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const { currentWorkspace } = useWorkspace();

  useEffect(() => {
    if (currentWorkspace) {
      loadFiles();
    }
  }, [refresh, currentWorkspace]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      if (!currentWorkspace) {
        setFiles([]);
        return;
      }

      const { data, error } = await supabase.storage
        .from('documents')
        .list(`${currentWorkspace.id}/${user.id}`);

      if (error) throw error;

      const processedFiles = (data || []).map(file => {
        const parts = file.name.split('-');
        const originalName = parts.slice(2).join('-');
        return {
          ...file,
          originalName
        };
      });

      const sortedFiles = processedFiles.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );

      setFiles(sortedFiles);
    } catch (error) {
      console.error('Error loading files:', error);
      customToast.error('Error loading your files');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileName) => {
    try {
      if (!currentWorkspace) {
        customToast.error('Please select a workspace first');
        return;
      }

      setDeleting(fileName);
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;

      // Get file metadata for size
      const { data: fileMetadata } = await supabase.storage
        .from('documents')
        .list(`${currentWorkspace.id}/${user.id}`, {
          search: fileName
        });

      const fileSize = fileMetadata?.[0]?.metadata?.size || 0;

      // Delete the file
      const { error: deleteError } = await supabase.storage
        .from('documents')
        .remove([`${currentWorkspace.id}/${user.id}/${fileName}`]);

      if (deleteError) throw deleteError;

      // Update storage usage
      const { error: updateError } = await supabase.rpc('decrease_storage_usage', {
        user_id_input: user.id,
        bytes_to_remove: fileSize
      });

      if (updateError) throw updateError;

      // Delete parsed content if it exists
      const { error: contentDeleteError } = await supabase
        .from('document_content')
        .delete()
        .eq('file_path', `${currentWorkspace.id}/${user.id}/${fileName}`);

      if (contentDeleteError) throw contentDeleteError;

      setFiles(files.filter(file => file.name !== fileName));
      customToast.success('File deleted successfully');
      loadFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      customToast.error('Error deleting file');
    } finally {
      setDeleting(null);
    }
  };

  const downloadFile = async (fileName, originalName) => {
    try {
      if (!currentWorkspace) {
        customToast.error('Please select a workspace first');
        return;
      }

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.storage
        .from('documents')
        .download(`${currentWorkspace.id}/${user.id}/${fileName}`);

      if (error) throw error;

      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = originalName || fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      customToast.error('Error downloading file');
    }
  };

  const getFileIconProps = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    
    const typeMap = {
      'pdf': { 
        color: 'mistyrose',
        type: 'acrobat',
      },
      'doc': { 
        color: 'aliceblue',
        type: 'document',
      },
      'docx': { 
        color: 'aliceblue',
        type: 'document',
      },
      'txt': { 
        color: 'ghostwhite',
        type: 'document',
      },
    };

    return {
      extension,
      ...(typeMap[extension] || { color: 'aliceblue', type: 'document' }),
      fold: true,
      radius: 8,
    };
  };

  if (!currentWorkspace) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No workspace selected</h3>
          <p className="text-muted-foreground">Please select or create a workspace to view files</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return <FilePreviewSkeleton />;
  }

  if (files.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No files uploaded</h3>
          <p className="text-muted-foreground mb-4">Your uploaded files will appear here</p>
          <Link href="/files">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              Upload your first file
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <CardTitle>Recent Files</CardTitle>
            <Badge variant="secondary">{files.length}</Badge>
          </div>
          <Link 
            href="/files" 
            className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1 group"
          >
            View all files
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {files.slice(0, 2).map((file) => (
          <div
            key={file.name}
            className="group flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all"
          >
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-10 h-10 flex-shrink-0 rounded-lg bg-white border p-2">
                <FileIcon
                  {...getFileIconProps(file.originalName)}
                  {...defaultStyles}
                />
              </div>
              <div className="min-w-0">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <h3 className="font-medium text-sm text-gray-900 truncate max-w-[200px] sm:max-w-[300px]">
                        {file.originalName}
                      </h3>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="text-sm">{file.originalName}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{bytesToSize(file.metadata?.size || 0)}</span>
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => downloadFile(file.name, file.originalName)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Download file</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(file.name)}
                      disabled={deleting === file.name}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-red-600"
                    >
                      {deleting === file.name ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete file</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        ))}
        
        {files.length > 2 && (
          <Link href="/files">
            <div className="text-center p-3 border border-dashed border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all cursor-pointer group">
              <p className="text-sm text-muted-foreground group-hover:text-purple-600">
                +{files.length - 2} more files
              </p>
            </div>
          </Link>
        )}
      </CardContent>
    </Card>
  );
} 
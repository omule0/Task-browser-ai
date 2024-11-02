"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { FileText, Trash2, Download, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { useWorkspace } from '@/context/workspace-context';

function FilePreviewSkeleton() {
  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <Skeleton className="w-5 h-5 rounded" />
              <div>
                <Skeleton className="h-4 w-48 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="w-8 h-8 rounded" />
              <Skeleton className="w-8 h-8 rounded" />
            </div>
          </div>
        ))}
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
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
      toast.error('Error loading your files');
    } finally {
      setLoading(false);
    }
  };

  const deleteFile = async (fileName) => {
    try {
      if (!currentWorkspace) {
        toast.error('Please select a workspace first');
        return;
      }

      setDeleting(fileName);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.storage
        .from('documents')
        .remove([`${currentWorkspace.id}/${user.id}/${fileName}`]);

      if (error) throw error;

      setFiles(files.filter(file => file.name !== fileName));
      toast.success('File deleted successfully');
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Error deleting file');
    } finally {
      setDeleting(null);
    }
  };

  const downloadFile = async (fileName, originalName) => {
    try {
      if (!currentWorkspace) {
        toast.error('Please select a workspace first');
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
      toast.error('Error downloading file');
    }
  };

  if (!currentWorkspace) {
    return (
      <div className="bg-white rounded-lg p-6 text-center">
        <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">No workspace selected</h3>
        <p className="text-gray-500">Please select or create a workspace to view files</p>
      </div>
    );
  }

  if (loading) {
    return <FilePreviewSkeleton />;
  }

  if (files.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 text-center">
        <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">No files uploaded</h3>
        <p className="text-gray-500">Your uploaded files will appear here</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Recent Files</h3>
        <Link 
          href="/files" 
          className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
        >
          View all files
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="space-y-3">
        {files.slice(0, 2).map((file) => (
          <div
            key={file.name}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {file.originalName || file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(file.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => downloadFile(file.name, file.originalName)}
                className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => deleteFile(file.name)}
                disabled={deleting === file.name}
                className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                title="Delete"
              >
                {deleting === file.name ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        ))}
        {files.length > 2 && (
          <Link href="/files">
            <div className="text-center p-3 border border-dashed border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors cursor-pointer">
              <p className="text-sm text-gray-500">
                +{files.length - 2} more files
              </p>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
} 
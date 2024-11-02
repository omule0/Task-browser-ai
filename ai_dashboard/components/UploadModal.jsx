"use client";
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, Loader2, FileText } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'react-hot-toast';
import { useWorkspace } from "@/context/workspace-context";

export function UploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState([]);
  const { currentWorkspace } = useWorkspace();

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv']
    },
    maxSize: 10485760, // 10MB
  });

  const uploadFiles = async () => {
    try {
      if (!currentWorkspace) {
        toast.error('Please select a workspace first');
        return;
      }

      setUploading(true);
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;

      const workspacePath = `${currentWorkspace.id}/${user.id}`;
      
      for (const file of files) {
        const originalName = file.name;
        const timestamp = new Date().getTime();
        const randomId = Math.random().toString(36).substring(2, 15);
        const fileName = `${timestamp}-${randomId}-${originalName}`;
        const filePath = `${workspacePath}/${fileName}`;

        const { data: existingFiles } = await supabase.storage
          .from('documents')
          .list(workspacePath);

        const fileExists = existingFiles?.some(f => f.name === fileName);
        if (fileExists) {
          throw new Error(`File ${originalName} already exists`);
        }

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          if (uploadError.message.includes('storage/object-exists')) {
            throw new Error(`File ${originalName} already exists`);
          }
          throw uploadError;
        }
      }

      toast.success('Files uploaded successfully');
      setFiles([]);
      if (onUploadSuccess) {
        onUploadSuccess();
      }
      onClose();
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error(error.message || 'Error uploading files');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Upload Files</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            ${isDragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300'}
            ${files.length > 0 ? 'border-green-500 bg-green-50' : ''}`}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-2">
            {isDragActive
              ? "Drop the files here"
              : "Drag and drop files here, or click to select files"}
          </p>
          <p className="text-sm text-gray-500">
            Supported files: PDF, DOC, DOCX, TXT, XLS, XLSX, CSV (Max 10MB)
          </p>
        </div>

        {files.length > 0 && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">Selected Files:</h3>
            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file.name}
                  className="flex items-center justify-between bg-gray-50 p-2 rounded"
                >
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{file.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end mt-6 space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={uploadFiles}
            disabled={files.length === 0 || uploading}
            className={`px-4 py-2 text-sm text-white rounded-md flex items-center
              ${files.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Uploading...
              </>
            ) : (
              'Upload Files'
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 
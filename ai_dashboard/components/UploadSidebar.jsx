"use client";
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, Loader2, FileText, XCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { customToast } from "@/components/ui/toast-theme";
import { useWorkspace } from "@/context/workspace-context";
import { Progress } from "@/components/ui/progress";
import { FileIcon, defaultStyles } from 'react-file-icon';

export function UploadSidebar({ isOpen, onClose, onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [fileNames, setFileNames] = useState({});
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
      // 'application/vnd.ms-excel': ['.xls'],
      // 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      // 'text/csv': ['.csv']
    },
    maxSize: 10485760, // 10MB
  });

  const simulateProgress = (fileName) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress > 95) {
        clearInterval(interval);
        progress = 95; // Cap at 95% until actual upload completes
      }
      setUploadProgress(prev => ({
        ...prev,
        [fileName]: Math.min(Math.round(progress), 95)
      }));
    }, 300);
    return interval;
  };

  const uploadFiles = async () => {
    try {
      if (!currentWorkspace) {
        customToast.error('Please select a workspace first');
        return;
      }

      setUploading(true);
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;

      const workspacePath = `${currentWorkspace.id}/${user.id}`;
      
      const fileMapping = {};
      files.forEach(file => {
        const timestamp = new Date().getTime();
        const randomId = Math.random().toString(36).substring(2, 15);
        const fileName = `${timestamp}-${randomId}-${file.name}`;
        fileMapping[file.name] = fileName;
      });
      setFileNames(fileMapping);
      
      const intervals = files.map(file => simulateProgress(file.name));
      
      const uploadPromises = files.map(async (file) => {
        try {
          const fileName = fileMapping[file.name];
          const filePath = `${workspacePath}/${fileName}`;

          const { data: existingFiles } = await supabase.storage
            .from('documents')
            .list(workspacePath);

          const fileExists = existingFiles?.some(f => f.name === fileName);
          if (fileExists) {
            throw new Error(`File ${file.name} already exists`);
          }

          const { error: uploadError } = await supabase.storage
            .from('documents')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) throw uploadError;

          setUploadProgress(prev => ({
            ...prev,
            [file.name]: 100
          }));

          return { success: true, fileName: file.name };
        } catch (error) {
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: 0
          }));
          return { success: false, fileName: file.name, error: error.message };
        }
      });

      const results = await Promise.all(uploadPromises);
      
      intervals.forEach(interval => clearInterval(interval));
      
      const failures = results.filter(r => !r.success);
      const successes = results.filter(r => r.success);

      if (successes.length > 0) {
        customToast.success(`Successfully uploaded ${successes.length} file(s)`);
        setFiles([]);
        if (onUploadSuccess) {
          onUploadSuccess();
        }
        onClose();
      }

      if (failures.length > 0) {
        failures.forEach(({ fileName, error }) => {
          customToast.error(`Failed to upload ${fileName}: ${error}`);
        });
      }

    } catch (error) {
      console.error('Error uploading files:', error);
      customToast.error(error.message || 'Error uploading files');
    } finally {
      setUploading(false);
      setUploadProgress({});
      setFileNames({});
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

  const removeFile = (fileName) => {
    setFiles(files.filter(file => file.name !== fileName));
    // Also clean up any progress state if it exists
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileName];
      return newProgress;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-white shadow-xl z-50 flex flex-col">
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Upload Files</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
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
            Supported file types: PDF, DOC, DOCX, TXT (Max 10MB)
            {/* Supported files: PDF, DOC, DOCX, TXT, XLS, XLSX, CSV (Max 10MB) */}
          </p>
        </div>

        {files.length > 0 && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">Selected Files:</h3>
            <div className="space-y-3">
              {files.map((file) => (
                <div
                  key={file.name}
                  className="flex flex-col bg-gray-50 p-3 rounded group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5" style={{ WebkitFontSmoothing: 'antialiased' }}>
                        <FileIcon
                          {...getFileIconProps(file.name)}
                          {...defaultStyles}
                        />
                      </div>
                      <span className="text-sm">{file.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                      {!uploading && (
                        <button
                          onClick={() => removeFile(file.name)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                          title="Remove file"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  {uploading && (
                    <div className="w-full">
                      <Progress 
                        value={uploadProgress[file.name] || 0} 
                        className="h-2"
                      />
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-gray-500">
                          {uploadProgress[file.name] === 100 ? (
                            <span className="text-green-600">Complete</span>
                          ) : (
                            `${uploadProgress[file.name] || 0}%`
                          )}
                        </span>
                        {uploadProgress[file.name] === 100 && (
                          <span className="text-xs text-green-600">✓</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t p-6">
        <div className="flex justify-end space-x-3">
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
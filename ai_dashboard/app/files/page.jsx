"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { FileText, Download, Trash2, Loader2, Search, Upload, File, Image, X } from "lucide-react";
import { customToast } from "@/components/ui/toast-theme";
import { Loading } from "@/components/ui/loading";
import { useWorkspace } from "@/context/workspace-context";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDropzone } from 'react-dropzone';
import { Progress } from "@/components/ui/progress";
import { FileIcon, defaultStyles } from 'react-file-icon';
import { StorageUsage } from "@/components/StorageUsage";

export default function FilesPage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [fileNames, setFileNames] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const { currentWorkspace } = useWorkspace();
  const [storageRefresh, setStorageRefresh] = useState(0);
  const [selectedFileContent, setSelectedFileContent] = useState(null);

  useEffect(() => {
    if (currentWorkspace) {
      loadFiles();
    }
  }, [currentWorkspace]);

  const loadFiles = async () => {
    try {
      if (!currentWorkspace) {
        setFiles([]);
        return;
      }

      setLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
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

  const deleteFile = async (fileName) => {
    try {
      if (!currentWorkspace) return;
      
      setDeleting(fileName);
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;

      const { data: fileMetadata } = await supabase.storage
        .from('documents')
        .list(`${currentWorkspace.id}/${user.id}`, {
          search: fileName
        });

      const fileSize = fileMetadata?.[0]?.metadata?.size || 0;

      // Delete the file from storage
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

      // Delete document chunks
      const { error: chunksDeleteError } = await supabase
        .from('document_chunks')
        .delete()
        .eq('file_id', `${currentWorkspace.id}/${user.id}/${fileName}`);

      if (chunksDeleteError) throw chunksDeleteError;

      // Delete parsed content
      const { error: contentDeleteError } = await supabase
        .from('document_content')
        .delete()
        .eq('file_path', `${currentWorkspace.id}/${user.id}/${fileName}`);

      if (contentDeleteError) throw contentDeleteError;

      setFiles(prev => prev.filter(file => file.name !== fileName));
      setStorageRefresh(prev => prev + 1);
      customToast.success('File deleted successfully');

    } catch (error) {
      console.error('Error deleting file:', error);
      customToast.error('Error deleting file');
    } finally {
      setDeleting(null);
    }
  };

  const downloadFile = async (fileName, originalName) => {
    try {
      if (!currentWorkspace) return;

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

  const filteredFiles = files.filter(file => 
    file.originalName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFileSelection = (fileName) => {
    setSelectedFiles(prev => 
      prev.includes(fileName)
        ? prev.filter(name => name !== fileName)
        : [...prev, fileName]
    );
  };

  const toggleSelectAll = () => {
    setSelectedFiles(prev => 
      prev.length === filteredFiles.length ? [] : filteredFiles.map(file => file.name)
    );
  };

  const deleteSelectedFiles = async () => {
    try {
      if (!currentWorkspace || selectedFiles.length === 0) return;
      
      setIsDeleting(true);
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;

      let totalSize = 0;
      const deletePromises = selectedFiles.map(async (fileName) => {
        try {
          // Get file size for storage calculation
          const { data: fileMetadata } = await supabase.storage
            .from('documents')
            .list(`${currentWorkspace.id}/${user.id}`, {
              search: fileName
            });

          const fileSize = fileMetadata?.[0]?.metadata?.size || 0;
          totalSize += fileSize;

          // Delete file from storage
          await supabase.storage
            .from('documents')
            .remove([`${currentWorkspace.id}/${user.id}/${fileName}`]);

          // Delete document chunks
          await supabase
            .from('document_chunks')
            .delete()
            .eq('file_id', `${currentWorkspace.id}/${user.id}/${fileName}`);

          // Delete parsed content
          await supabase
            .from('document_content')
            .delete()
            .eq('file_path', `${currentWorkspace.id}/${user.id}/${fileName}`);

          return { success: true, fileName };
        } catch (error) {
          return { success: false, fileName, error };
        }
      });

      const results = await Promise.all(deletePromises);
      const failures = results.filter(r => !r.success);
      const successes = results.filter(r => r.success);

      if (successes.length > 0) {
        // Update storage usage once for all deleted files
        await supabase.rpc('decrease_storage_usage', {
          user_id_input: user.id,
          bytes_to_remove: totalSize
        });

        setFiles(prev => prev.filter(file => !selectedFiles.includes(file.name)));
        setSelectedFiles([]);
        setStorageRefresh(prev => prev + 1);
        customToast.success(`Successfully deleted ${successes.length} file(s)`);
      }

      if (failures.length > 0) {
        failures.forEach(({ fileName }) => {
          customToast.error(`Failed to delete ${fileName}`);
        });
      }

    } catch (error) {
      console.error('Error deleting files:', error);
      customToast.error('Error deleting files');
    } finally {
      setIsDeleting(false);
    }
  };

  const simulateProgress = (fileName) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress > 95) {
        clearInterval(interval);
        progress = 95;
      }
      setUploadProgress(prev => ({
        ...prev,
        [fileName]: Math.min(Math.round(progress), 95)
      }));
    }, 300);
    return interval;
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    try {
      if (!currentWorkspace) {
        customToast.error('Please select a workspace first');
        return;
      }

      setUploadingFiles(acceptedFiles);
      setIsUploading(true);

      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;

      // Get current storage usage
      const { data: storageData, error: storageError } = await supabase
        .from('storage_usage')
        .select('bytes_used, storage_limit')
        .eq('user_id', user.id)
        .single();

      if (storageError && storageError.code !== 'PGRST116') throw storageError;

      // Calculate total size of new files
      const totalNewSize = acceptedFiles.reduce((acc, file) => acc + file.size, 0);
      const currentUsage = storageData?.bytes_used || 0;
      const storageLimit = storageData?.storage_limit || 52428800; // 50MB default

      // Check if upload would exceed limit
      if (currentUsage + totalNewSize > storageLimit) {
        throw new Error(`Upload would exceed your storage limit of ${formatBytes(storageLimit)}`);
      }

      const workspacePath = `${currentWorkspace.id}/${user.id}`;
      
      const fileMapping = {};
      acceptedFiles.forEach(file => {
        const timestamp = new Date().getTime();
        const randomId = Math.random().toString(36).substring(2, 15);
        const fileName = `${timestamp}-${randomId}-${file.name}`;
        fileMapping[file.name] = fileName;
      });
      setFileNames(fileMapping);
      
      const intervals = acceptedFiles.map(file => simulateProgress(file.name));
      
      const uploadPromises = acceptedFiles.map(async (file) => {
        try {
          const fileName = fileMapping[file.name];
          const filePath = `${workspacePath}/${fileName}`;

          let parsedText = '';
          if (file.type === 'application/pdf') {
            try {
              const formData = new FormData();
              formData.append('filepond', file);
              const response = await fetch('/api/pdf', {
                method: 'POST',
                body: formData,
              });
              
              if (!response.ok) {
                throw new Error('PDF parsing failed');
              }
              
              parsedText = await response.text();

              // Store parsed content in document_content table
              const { error: contentError } = await supabase
                .from('document_content')
                .insert({
                  file_path: filePath,
                  content: parsedText,
                  workspace_id: currentWorkspace.id,
                  user_id: user.id
                });

              if (contentError) throw contentError;
            } catch (error) {
              console.error('Error parsing PDF:', error);
              customToast.error('Error parsing PDF content');
            }
          }

          const { error: uploadError } = await supabase.storage
            .from('documents')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false,
              metadata: {
                size: file.size,
                hasParsedContent: Boolean(parsedText), // Flag to indicate if content exists
              }
            });

          if (uploadError) throw uploadError;

          const { error: updateError } = await supabase.rpc('update_storage_usage', {
            user_id_input: user.id,
            bytes_to_add: file.size
          });

          if (updateError) throw updateError;

          setUploadProgress(prev => ({
            ...prev,
            [file.name]: 100
          }));

          return { success: true, fileName: file.name, size: file.size };
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
        await loadFiles(); // Refresh the file list
      }

      if (failures.length > 0) {
        failures.forEach(({ fileName, error }) => {
          customToast.error(`Failed to upload ${fileName}: ${error}`);
        });
      }

      setStorageRefresh(prev => prev + 1); // Trigger storage usage refresh

    } catch (error) {
      console.error('Error uploading files:', error);
      customToast.error(error.message || 'Error uploading files');
    } finally {
      setIsUploading(false);
      setUploadProgress({});
      setFileNames({});
      setUploadingFiles([]);
    }
  }, [currentWorkspace]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      // 'application/msword': ['.doc'],
      // 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      // 'text/plain': ['.txt'],
    },
    maxSize: 10485760, // 10MB
  });


  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIconProps = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    
    const typeMap = {
      // Documents (Orange gradient)
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
      // Spreadsheets (Green gradient)
      'xls': { 
        color: 'palegreen',
        type: 'spreadsheet',
      },
      'xlsx': { 
        color: 'palegreen',
        type: 'spreadsheet',
      },
      'csv': { 
        color: 'palegreen',
        type: 'spreadsheet',
      },
    };

    const defaultStyle = {
      color: 'aliceblue',
      type: 'document',
    };

    return {
      extension,
      ...(typeMap[extension] || defaultStyle),
      fold: true,
      radius: 8,
    };
  };

  // Add formatBytes helper function
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const viewPDFContent = async (file) => {
    try {
      const supabase = createClient();
      
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // Get the parsed content from document_content table
      const { data: contentData, error: contentError } = await supabase
        .from('document_content')
        .select('content')
        .eq('file_path', `${currentWorkspace.id}/${user.id}/${file.name}`)
        .single();

      if (contentError) throw contentError;

      if (!contentData?.content) {
        customToast.error('No parsed content available for this file');
        return;
      }

      setSelectedFileContent({
        name: file.originalName,
        content: contentData.content
      });
    } catch (error) {
      console.error('Error viewing PDF content:', error);
      customToast.error('Error viewing PDF content');
    }
  };

  const renderActions = (file) => (
    <div className="flex justify-end gap-2">
      <Button
        size="icon"
        variant="ghost"
        onClick={() => downloadFile(file.name, file.originalName)}
        title="Download"
      >
        <Download className="h-4 w-4" />
        <span className="sr-only">Download</span>
      </Button>
      {file.originalName.toLowerCase().endsWith('.pdf') && (
        <Button
          size="icon"
          variant="ghost"
          onClick={() => viewPDFContent(file)}
          title="View Content"
        >
          <FileText className="h-4 w-4" />
          <span className="sr-only">View Content</span>
        </Button>
      )}
      <Button
        size="icon"
        variant="ghost"
        onClick={() => deleteFile(file.name)}
        disabled={deleting === file.name}
        title="Delete"
      >
        {deleting === file.name ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
        <span className="sr-only">Delete</span>
      </Button>
    </div>
  );


  if (loading) {
    return (
      <Loading/>
    );
  }

  return (
    <>
    <title>Files</title>
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Files</h1>
          <p className="text-muted-foreground">Upload and manage your documents</p>
        </div>
        
        {selectedFiles.length > 0 && (
          <div className="flex items-center gap-4">
            <Badge variant="secondary">
              {selectedFiles.length} selected
            </Badge>
            <Button
              variant="destructive"
              size="sm"
              onClick={deleteSelectedFiles}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete Selected
            </Button>
          </div>
        )}
      </div>

      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 transition-colors ${
          isDragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-muted hover:bg-muted/50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <div className="p-3 rounded-full bg-primary/10">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold">Drop files here or click to upload</h3>
          <p className="text-sm text-muted-foreground">
            PDF (Max 10MB)
            {/* PDF, DOC, DOCX, TXT (Max 10MB) */}
          </p>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">Uploading Files</h3>
          <div className="space-y-3">
            {uploadingFiles.map((file) => (
              <div
                key={file.name}
                className="bg-muted/50 p-4 rounded-lg space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8">
                      <FileIcon {...getFileIconProps(file.name)} {...defaultStyles} />
                    </div>
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {uploadProgress[file.name]}%
                  </span>
                </div>
                <Progress value={uploadProgress[file.name] || 0} className="h-1" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Files Section - Table for desktop, Cards for mobile */}
      <div className="rounded-lg border border-border bg-card">
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search files..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-muted/50 border-0 rounded-md focus-visible:ring-2 focus-visible:ring-ring"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px] pl-4">
                  <Checkbox
                    checked={selectedFiles.length === filteredFiles.length}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all files"
                  />
                </TableHead>
                <TableHead>File name</TableHead>
                <TableHead>Date uploaded</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    <div className="flex flex-col items-center gap-2 py-4">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No files found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredFiles.map((file) => (
                  <TableRow 
                    key={file.name}
                    className={selectedFiles.includes(file.name) ? 'bg-primary/5' : ''}
                  >
                    <TableCell className="pl-4">
                      <Checkbox
                        checked={selectedFiles.includes(file.name)}
                        onCheckedChange={() => toggleFileSelection(file.name)}
                        aria-label={`Select ${file.originalName}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4">
                          <FileIcon
                            {...getFileIconProps(file.originalName)}
                            {...defaultStyles}
                          />
                        </div>
                        <div>
                          <div className="font-medium">{file.originalName}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatFileSize(file.metadata?.size)}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(file.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="uppercase">
                        {file.originalName.split('.').pop()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      {renderActions(file)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="block md:hidden divide-y divide-border">
          {filteredFiles.length === 0 ? (
            <div className="p-4 text-center">
              <div className="flex flex-col items-center gap-2">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">No files found</p>
              </div>
            </div>
          ) : (
            <div className="divide-y">
              {filteredFiles.map((file) => (
                <div key={file.name} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center h-full pt-1">
                      <Checkbox
                        checked={selectedFiles.includes(file.name)}
                        onCheckedChange={() => toggleFileSelection(file.name)}
                        aria-label={`Select ${file.originalName}`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8">
                          <FileIcon
                            {...getFileIconProps(file.originalName)}
                            {...defaultStyles}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{file.originalName}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{formatFileSize(file.metadata?.size)}</span>
                            <span>•</span>
                            <span>{format(new Date(file.created_at), "MMM d, yyyy")}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="secondary" className="uppercase">
                          {file.originalName.split('.').pop()}
                        </Badge>
                        <div className="flex-1" />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => downloadFile(file.name, file.originalName)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        {file.originalName.toLowerCase().endsWith('.pdf') && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => viewPDFContent(file)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteFile(file.name)}
                          disabled={deleting === file.name}
                        >
                          {deleting === file.name ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* PDF Content Modal with improved styling */}
      {selectedFileContent && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
          <div className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-2xl max-h-[80vh] border border-border rounded-lg bg-card shadow-lg">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">{selectedFileContent.name}</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedFileContent(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-8rem)]">
              <pre className="whitespace-pre-wrap text-sm text-foreground">
                {selectedFileContent.content}
              </pre>
            </div>
          </div>
        </div>
      )}
      {/* Storage Usage Card */}
      <div className="rounded-lg border border-border bg-card">
        <StorageUsage refresh={storageRefresh} />
      </div>
    </div>
    </>
  );
} 
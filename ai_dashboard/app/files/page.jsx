"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { FileText, Download, Trash2, Loader2, Search, Upload, File, Image } from "lucide-react";
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

export default function FilesPage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const { currentWorkspace } = useWorkspace();

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
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.storage
        .from('documents')
        .remove([`${currentWorkspace.id}/${user.id}/${fileName}`]);

      if (error) throw error;

      setFiles(files.filter(file => file.name !== fileName));
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
      const { data: { user } } = await supabase.auth.getUser();
      
      const deletePromises = selectedFiles.map(fileName => 
        supabase.storage
          .from('documents')
          .remove([`${currentWorkspace.id}/${user.id}/${fileName}`])
      );

      await Promise.all(deletePromises);

      setFiles(files.filter(file => !selectedFiles.includes(file.name)));
      setSelectedFiles([]);
      customToast.success(`Successfully deleted ${selectedFiles.length} file(s)`);
    } catch (error) {
      console.error('Error deleting files:', error);
      customToast.error('Error deleting files');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    // TODO: Implement file upload logic here
    console.log('Files to upload:', files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files || []);
    // TODO: Implement file upload logic here
    console.log('Files to upload:', files);
  };

  const getFileIcon = (fileName) => {
    if (fileName.toLowerCase().endsWith('.pdf')) {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else if (fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/)) {
      return <Image className="h-5 w-5 text-blue-500" />;
    }
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <Loading/>
    );
  }

  return (
    <>
    <title>Files</title>
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Files</h1>
          <p className="text-gray-500">Manage your uploaded files</p>
        </div>
        {selectedFiles.length > 0 && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {selectedFiles.length} selected
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={deleteSelectedFiles}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Selected
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      <div
        className={`mb-6 border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
          isDragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:bg-gray-50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          multiple
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-gray-400" />
            <h3 className="text-lg font-semibold">Click to upload or drag and drop</h3>
            <p className="text-sm text-gray-500">Maximum file size 50 MB</p>
          </div>
        </label>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search files..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Desktop view */}
        <div className="hidden md:block overflow-x-auto">
          <div className="rounded-lg border">
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
                {filteredFiles.map((file) => (
                  <TableRow 
                    key={file.name}
                    className={selectedFiles.includes(file.name) ? 'bg-purple-50' : ''}
                  >
                    <TableCell className="pl-4">
                      <Checkbox
                        checked={selectedFiles.includes(file.name)}
                        onCheckedChange={() => toggleFileSelection(file.name)}
                        aria-label={`Select ${file.originalName}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getFileIcon(file.originalName)}
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
                    </TableCell>
                  </TableRow>
                ))}
                {filteredFiles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No files found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Mobile view */}
        <div className="md:hidden">
          {filteredFiles.map((file) => (
            <div 
              key={file.name} 
              className={`p-4 border-b last:border-b-0 ${
                selectedFiles.includes(file.name) ? 'bg-purple-50' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={selectedFiles.includes(file.name)}
                    onCheckedChange={() => toggleFileSelection(file.name)}
                    aria-label={`Select ${file.originalName}`}
                  />
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.originalName}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(file.created_at).toLocaleDateString()} • 
                      {' ' + file.originalName.split('.').pop().toUpperCase()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => downloadFile(file.name, file.originalName)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                    title="Download"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => deleteFile(file.name)}
                    disabled={deleting === file.name}
                    className="p-2 text-gray-400 hover:text-red-600"
                    title="Delete"
                  >
                    {deleting === file.name ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredFiles.length === 0 && (
          <div className="px-6 py-4 text-center text-gray-500">
            No files found
          </div>
        )}
      </div>
    </div>
    </>
  );
} 
"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { FileText, Download, Trash2, Loader2, Search } from "lucide-react";
import { customToast } from "@/components/ui/toast-theme";
import { Loading } from "@/components/ui/loading";
import { useWorkspace } from "@/context/workspace-context";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

export default function FilesPage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
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
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <Checkbox
                    checked={selectedFiles.length === filteredFiles.length}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all files"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Uploaded</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFiles.map((file) => (
                <tr 
                  key={file.name} 
                  className={`hover:bg-gray-50 ${
                    selectedFiles.includes(file.name) ? 'bg-purple-50' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <Checkbox
                      checked={selectedFiles.includes(file.name)}
                      onCheckedChange={() => toggleFileSelection(file.name)}
                      aria-label={`Select ${file.originalName}`}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{file.originalName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(file.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {file.originalName.split('.').pop().toUpperCase()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => downloadFile(file.name, file.originalName)}
                        className="text-gray-400 hover:text-gray-600"
                        title="Download"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteFile(file.name)}
                        disabled={deleting === file.name}
                        className="text-gray-400 hover:text-red-600"
                        title="Delete"
                      >
                        {deleting === file.name ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
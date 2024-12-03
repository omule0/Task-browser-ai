"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  Plus,
  ArrowLeft,
  PanelLeftClose,
  PanelLeft,
  FileText,
} from "lucide-react";
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { cn } from "@/lib/utils";
import { WorkspaceSwitcher } from "@/components/WorkspaceSwitcher";
import { useWorkspace } from "@/context/workspace-context";
import { useDropzone } from 'react-dropzone';
import { createClient } from '@/utils/supabase/client';
import { customToast } from "@/components/ui/toast-theme";
import { Loader2, Upload } from "lucide-react";
import { FileIcon, defaultStyles } from 'react-file-icon';
import { format } from 'date-fns';
import dynamic from 'next/dynamic';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const PdfViewer = dynamic(() => import('@/components/PdfViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
    </div>
  ),
});

export default function PDFChat() {
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { currentWorkspace } = useWorkspace();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [files, setFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        router.push('/');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  // Add file upload handler
  const onDrop = useCallback(async (acceptedFiles) => {
    try {
      if (!currentWorkspace) {
        customToast.error('Please select a workspace first');
        return;
      }

      setIsUploading(true);
      const file = acceptedFiles[0]; // Only handle one file at a time

      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;

      // Check storage usage
      const { data: storageData, error: storageError } = await supabase
        .from('storage_usage')
        .select('bytes_used, storage_limit')
        .eq('user_id', user.id)
        .single();

      if (storageError && storageError.code !== 'PGRST116') throw storageError;

      const currentUsage = storageData?.bytes_used || 0;
      const storageLimit = storageData?.storage_limit || 52428800; // 50MB default

      if (currentUsage + file.size > storageLimit) {
        throw new Error('Upload would exceed your storage limit');
      }

      // Start progress simulation
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 95) {
          clearInterval(progressInterval);
          progress = 95;
        }
        setUploadProgress(Math.min(Math.round(progress), 95));
      }, 300);

      // Parse PDF content
      const formData = new FormData();
      formData.append('filepond', file);
      const parseResponse = await fetch('/api/pdf', {
        method: 'POST',
        body: formData,
      });
      
      if (!parseResponse.ok) {
        throw new Error('PDF parsing failed');
      }
      
      const parsedText = await parseResponse.text();

      // Generate unique filename
      const timestamp = new Date().getTime();
      const randomId = Math.random().toString(36).substring(2, 15);
      const fileName = `${timestamp}-${randomId}-${file.name}`;
      const filePath = `${currentWorkspace.id}/${user.id}/${fileName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          metadata: {
            size: file.size,
            hasParsedContent: true,
          }
        });

      if (uploadError) throw uploadError;

      // Store parsed content
      const { error: contentError } = await supabase
        .from('document_content')
        .insert({
          file_path: filePath,
          content: parsedText,
          workspace_id: currentWorkspace.id,
          user_id: user.id
        });

      if (contentError) throw contentError;

      // Update storage usage
      const { error: updateError } = await supabase.rpc('update_storage_usage', {
        user_id_input: user.id,
        bytes_to_add: file.size
      });

      if (updateError) throw updateError;

      clearInterval(progressInterval);
      setUploadProgress(100);
      customToast.success('PDF uploaded successfully');

    } catch (error) {
      console.error('Error uploading PDF:', error);
      customToast.error(error.message || 'Error uploading PDF');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [currentWorkspace]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxSize: 10485760, // 10MB
    multiple: false,
  });

  // Add upload zone to the sidebar
  const renderUploadZone = () => (
    <div
      {...getRootProps()}
      className={`mx-3 mb-3 border-2 border-dashed rounded-lg p-4 transition-colors ${
        isDragActive 
          ? 'border-white/50 bg-white/10' 
          : 'border-white/20 hover:border-white/30'
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-2">
        {isUploading ? (
          <>
            <Loader2 className="h-6 w-6 text-white animate-spin" />
            <p className="text-sm text-white/70 text-center">
              Uploading... {uploadProgress}%
            </p>
          </>
        ) : (
          <>
            <Upload className="h-6 w-6 text-white/70" />
            <p className="text-sm text-white/70 text-center">
              Drop PDF here or click to upload
            </p>
          </>
        )}
      </div>
    </div>
  );

  // Add loadFiles function
  const loadFiles = async () => {
    try {
      if (!currentWorkspace) {
        setFiles([]);
        return;
      }

      setLoadingFiles(true);
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
      customToast.error('Error loading files');
    } finally {
      setLoadingFiles(false);
    }
  };

  // Add useEffect to load files when workspace changes
  useEffect(() => {
    if (currentWorkspace) {
      loadFiles();
    }
  }, [currentWorkspace]);

  // Add helper function for file icons
  const getFileIconProps = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    return {
      extension,
      color: 'mistyrose',
      type: 'acrobat',
      fold: true,
      radius: 8,
    };
  };

  // Add this helper function to truncate file names
  const truncateFileName = (fileName, maxLength = 20) => {
    if (fileName.length <= maxLength) return fileName;
    
    const extension = fileName.split('.').pop();
    const nameWithoutExt = fileName.slice(0, -(extension.length + 1));
    
    if (nameWithoutExt.length <= maxLength - 5) return fileName;
    
    return `${nameWithoutExt.slice(0, maxLength - 5)}...${extension}`;
  };

  // Add function to handle file selection
  const handleFileSelect = async (file) => {
    try {
      if (!currentWorkspace) return;
      
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(`${currentWorkspace.id}/${user.id}/${file.name}`, 3600);

      if (error) throw error;

      setSelectedFile(file);
      setPdfUrl(data.signedUrl);
      
      // Generate initial summary and questions
      await Promise.all([
        generateInitialSummary(file),
        generateQuestions(file)
      ]);
    } catch (error) {
      console.error('Error selecting file:', error);
      customToast.error('Error loading PDF file');
    }
  };

  // Function to generate initial summary when PDF is selected
  const generateInitialSummary = useCallback(async (file) => {
    if (!file || !currentWorkspace) return;
    
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      const initialMessage = {
        role: 'user',
        content: 'Please provide a brief overview of this document.'
      };
      
      const response = await fetch('/api/pdf-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [initialMessage],
          fileId: `${currentWorkspace.id}/${user.id}/${file.name}`,
          workspaceId: currentWorkspace.id,
          userId: user.id
        })
      });

      if (!response.ok) throw new Error('Failed to generate summary');
      
      const data = await response.json();
      
      setMessages([
        initialMessage,
        { role: 'assistant', content: data.response }
      ]);
    } catch (error) {
      console.error('Error generating summary:', error);
      customToast.error('Failed to generate document summary');
    } finally {
      setIsLoading(false);
    }
  }, [currentWorkspace]);

  // Function to generate questions
  const generateQuestions = useCallback(async (file) => {
    if (!file || !currentWorkspace) return;
    
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      const response = await fetch('/api/pdf-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [],
          fileId: `${currentWorkspace.id}/${user.id}/${file.name}`,
          generateQuestions: true
        })
      });

      if (!response.ok) throw new Error('Failed to generate questions');
      
      const data = await response.json();
      
      // Parse the numbered list into an array
      const questions = data.suggestedQuestions
        .split('\n')
        .filter(line => line.trim())
        .map(line => line.replace(/^\d+\.\s*/, '').trim());
      
      setSuggestedQuestions(questions);
    } catch (error) {
      console.error('Error generating questions:', error);
      customToast.error('Failed to generate questions');
    }
  }, [currentWorkspace]);

  // Function to handle sending messages
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedFile || !currentWorkspace) return;

    const newMessage = {
      role: 'user',
      content: inputMessage
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const response = await fetch('/api/pdf-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, newMessage],
          fileId: `${currentWorkspace.id}/${user.id}/${selectedFile.name}`,
          workspaceId: currentWorkspace.id,
          userId: user.id
        })
      });

      if (!response.ok) throw new Error('Failed to get response');
      
      const data = await response.json();
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      customToast.error('Failed to get response');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-white text-gray-800">
      {/* Sidebar with reduced width */}
      <div 
        className={cn(
          "border-r border-gray-200 bg-[#1E1E1E] text-white flex flex-col transition-all duration-300",
          isSidebarCollapsed ? "w-0 overflow-hidden" : "w-72"
        )}
      >
        {/* ChatPDF header and back button */}
        <div className="p-3 flex items-center gap-2 border-b border-white/10">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => router.push('/')}
            className="mr-1 hover:bg-white/10 text-white h-8 w-8"
          >
            <ArrowLeft size={14} />
          </Button>
          <div className="w-6 h-6 bg-purple-600 rounded-lg"></div>
          <span className="font-semibold text-sm">ChatPDF</span>
        </div>

        {/* Workspace switcher */}
        <div className="p-3">
          <WorkspaceSwitcher isCollapsed={false} />
        </div>
        
        {/* Upload zone */}
        {renderUploadZone()}

        <ScrollArea className="flex-1 px-3">
          <div className="space-y-1.5 pb-3">
            {loadingFiles ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-white/70" />
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-white/70">No files uploaded</p>
              </div>
            ) : (
              files.map((file) => (
                <Button
                  key={file.name}
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-white/70 bg-white/10 hover:bg-white/20 border-0 h-auto py-2 px-3 text-sm group",
                    selectedFile?.name === file.name && "bg-white/20 border-l-4 border-purple-600"
                  )}
                  title={file.originalName}
                  onClick={() => handleFileSelect(file)}
                >
                  <div className="flex items-center gap-2 w-full min-w-0">
                    <div className="w-5 h-5 flex-shrink-0">
                      <FileIcon
                        {...getFileIconProps(file.originalName)}
                        {...defaultStyles}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm leading-none mb-1 group-hover:text-white transition-colors">
                        {truncateFileName(file.originalName)}
                      </p>
                      <p className="text-[10px] text-white/50 truncate">
                        {format(new Date(file.created_at), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                </Button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* PDF Viewer */}
        <div className="flex-1 flex flex-col">
          {/* PDF Header */}
          <div className="flex items-center px-3 py-2 border-b border-gray-200 gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="mr-1 h-8 w-8"
            >
              {isSidebarCollapsed ? <PanelLeft size={14} /> : <PanelLeftClose size={14} />}
            </Button>
            <h2 className="text-base font-semibold flex-1">
              {selectedFile ? selectedFile.originalName : 'No file selected'}
            </h2>
          </div>

          {/* PDF Content */}
          <div className="flex-1 bg-gray-100 flex justify-center overflow-auto">
            {!selectedFile ? (
              <div className="flex items-center justify-center w-full p-8">
                <div className="text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No file selected</h3>
                  <p className="text-sm text-gray-500">
                    Select a PDF file from the sidebar to view it here
                  </p>
                </div>
              </div>
            ) : !pdfUrl ? (
              <div className="flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="w-full h-full">
                <PdfViewer url={pdfUrl} />
              </div>
            )}
          </div>
        </div>

        {/* Chat Interface */}
        <div className="w-96 border-l border-gray-200 bg-white flex flex-col">
          <div className="h-12 border-b border-gray-200 flex items-center justify-between px-4">
            <h2 className="font-semibold">Chat</h2>
            <Button 
              size="sm"
              variant="ghost"
              className="gap-2 text-sm"
            >
              <Plus size={14} />
              New Chat
            </Button>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div 
                  key={index}
                  className={cn(
                    "flex gap-2 rounded-lg p-3",
                    message.role === 'assistant' ? 'bg-gray-100' : 'bg-purple-50'
                  )}
                >
                  <div 
                    className={cn(
                      "w-8 h-8 rounded-lg flex-shrink-0",
                      message.role === 'assistant' ? 'bg-purple-600' : 'bg-purple-400'
                    )}
                  />
                  <div className="flex-1">
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              )}
            </div>
          </ScrollArea>

          {suggestedQuestions.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-500 mb-2">Suggested Questions:</p>
              <div className="space-y-1.5">
                {suggestedQuestions.map((question, index) => (
                  <TooltipProvider key={index} delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className="w-full text-left px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                          onClick={() => {
                            // Set the input message and immediately send it
                            setInputMessage(question);
                            // We need to create a new message and send it manually
                            // since setInputMessage is asynchronous
                            const newMessage = {
                              role: 'user',
                              content: question
                            };
                            setMessages(prev => [...prev, newMessage]);
                            setIsLoading(true);

                            // Send the message
                            (async () => {
                              try {
                                const supabase = createClient();
                                const { data: { user } } = await supabase.auth.getUser();

                                const response = await fetch('/api/pdf-chat', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    messages: [...messages, newMessage],
                                    fileId: `${currentWorkspace.id}/${user.id}/${selectedFile.name}`,
                                    workspaceId: currentWorkspace.id,
                                    userId: user.id
                                  })
                                });

                                if (!response.ok) throw new Error('Failed to get response');
                                
                                const data = await response.json();
                                
                                setMessages(prev => [...prev, {
                                  role: 'assistant',
                                  content: data.response
                                }]);
                              } catch (error) {
                                console.error('Chat error:', error);
                                customToast.error('Failed to get response');
                              } finally {
                                setIsLoading(false);
                                setInputMessage(''); // Clear input after sending
                              }
                            })();
                          }}
                          disabled={isLoading}
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-purple-500 mt-0.5">•</span>
                            <span className="line-clamp-2">{question}</span>
                          </div>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent 
                        side="left" 
                        className="max-w-[300px] break-words"
                      >
                        {question}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 border-t border-gray-200">
            <div className="relative">
              <Input
                placeholder="Ask any question..."
                className="pr-20 bg-gray-100 border-gray-300"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={isLoading || !selectedFile}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-purple-600"
                  onClick={handleSendMessage}
                  disabled={isLoading || !selectedFile || !inputMessage.trim()}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
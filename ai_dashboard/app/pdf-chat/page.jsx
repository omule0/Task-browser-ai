"use client";
import { PdfChatSidebar } from "@/components/pdf-chat/PdfChatSidebar";
import { ChatInterface } from "@/components/pdf-chat/ChatInterface";
import { PdfSection } from "@/components/pdf-chat/PdfSection";
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
import { processDocumentContent } from '@/utils/text-processing';

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
  const [isQuestionsCollapsed, setIsQuestionsCollapsed] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        router.push('/');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  // Move loadFiles before onDrop
  const loadFiles = useCallback(async () => {
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
  }, [currentWorkspace]);

  // Then define onDrop
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

      // Reload files after successful upload
      await loadFiles();

    } catch (error) {
      console.error('Error uploading PDF:', error);
      customToast.error(error.message || 'Error uploading PDF');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [currentWorkspace, loadFiles]);

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

  // Keep the useEffect for initial file loading
  useEffect(() => {
    if (currentWorkspace) {
      loadFiles();
    }
  }, [currentWorkspace, loadFiles]);

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

  // Add this function near the top of your component
  const checkAndProcessDocument = async (file) => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get document content
      const { data: docContent, error: docError } = await supabase
        .from('document_content')
        .select('content')
        .eq('file_path', `${currentWorkspace.id}/${user.id}/${file.name}`)
        .single();

      if (docError) throw docError;
      if (!docContent) throw new Error('No content found for this document');

      // Process document content (will only process if not already processed)
      await processDocumentContent(
        docContent.content,
        `${currentWorkspace.id}/${user.id}/${file.name}`,
        currentWorkspace.id,
        user.id
      );

      return true;
    } catch (error) {
      console.error('Error checking/processing document:', error);
      customToast.error('Error preparing document for chat');
      return false;
    }
  };

  // Update the handleFileSelect function
  const handleFileSelect = async (file) => {
    try {
      setLoadingMessage('Preparing document for analysis...');
      
      if (!currentWorkspace) return;
      
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get signed URL for PDF viewer
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(`${currentWorkspace.id}/${user.id}/${file.name}`, 3600);

      if (error) throw error;

      // Check and process document if needed
      const isReady = await checkAndProcessDocument(file);
      if (!isReady) {
        setLoadingMessage('Failed to process document. Please try again.');
        return;
      }

      setSelectedFile(file);
      setPdfUrl(data.signedUrl);
      
      // Generate initial summary
      setLoadingMessage('Generating document summary...');
      await generateInitialSummary(file);
    } catch (error) {
      console.error('Error selecting file:', error);
      setLoadingMessage('Error loading PDF file. Please try again.');
      customToast.error('Error loading PDF file');
    } finally {
      // Clear loading message after a short delay
      setTimeout(() => setLoadingMessage(''), 2000);
    }
  };

  // Function to generate initial summary when PDF is selected
  const generateInitialSummary = useCallback(async (file) => {
    if (!file || !currentWorkspace) return;
    
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      const response = await fetch('/api/pdf-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [],
          fileId: `${currentWorkspace.id}/${user.id}/${file.name}`,
          workspaceId: currentWorkspace.id,
          userId: user.id,
          initialGreeting: true
        })
      });

      if (!response.ok) throw new Error('Failed to generate summary');
      
      const data = await response.json();
      
      setMessages([
        { 
          role: 'assistant', 
          content: `👋 Hi! I'm here to help you understand "${file.originalName}". Here's a brief overview:\n\n${data.response}`
        }
      ]);

      // Set suggested questions directly from the initial response
      setSuggestedQuestions(data.suggestedQuestions);
    } catch (error) {
      console.error('Error generating summary:', error);
      customToast.error('Failed to generate document summary');
    } finally {
      setIsLoading(false);
    }
  }, [currentWorkspace]);

  // Function to handle sending messages
  const handleSendMessage = async (messageText) => {
    const message = messageText || inputMessage;
    if (!message.trim() || !selectedFile || !currentWorkspace) return;

    const newMessage = {
      role: 'user',
      content: message
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsLoading(true);
    setLoadingMessage('Analyzing your question...');

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
        content: data.response,
        citations: data.citations
      }]);
      setLoadingMessage('');
    } catch (error) {
      console.error('Chat error:', error);
      setLoadingMessage('Failed to get response. Please try again.');
      customToast.error('Failed to get response');
    } finally {
      setIsLoading(false);
      setTimeout(() => setLoadingMessage(''), 2000);
    }
  };

  // Add a new function to handle creating a new chat
  const handleNewChat = () => {
    setLoadingMessage('Starting a new chat session...');
    
    // Reset chat-related states
    setMessages([]);
    setInputMessage('');
    setSuggestedQuestions([]);
    setIsLoading(false);

    // If a file is selected, generate an initial greeting
    if (selectedFile) {
      generateInitialSummary(selectedFile);
    }

    setTimeout(() => setLoadingMessage(''), 1500);
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <div className={cn(
        "transition-all duration-300",
        isSidebarCollapsed ? "w-0 overflow-hidden" : "flex"
      )}>
        <PdfChatSidebar 
          files={files}
          loadingFiles={loadingFiles}
          selectedFile={selectedFile}
          onFileSelect={handleFileSelect}
          onUpload={onDrop}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
        />
      </div>

      <div className="flex-1 flex">
        <PdfSection 
          selectedFile={selectedFile}
          pdfUrl={pdfUrl}
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
        />

        <ChatInterface 
          messages={messages}
          isLoading={isLoading}
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          handleSendMessage={handleSendMessage}
          suggestedQuestions={suggestedQuestions}
          isQuestionsCollapsed={isQuestionsCollapsed}
          setIsQuestionsCollapsed={setIsQuestionsCollapsed}
          selectedFile={selectedFile}
          onNewChat={handleNewChat}
          loadingMessage={loadingMessage}
        />
      </div>
    </div>
  );
} 
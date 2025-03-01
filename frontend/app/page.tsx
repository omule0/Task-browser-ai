'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { IconArrowDown, IconPhoto, IconLayoutColumns, IconInfoCircle, IconX, IconDownload } from '@tabler/icons-react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { 
  LoadingAnimation,
  UserQuery,
  AgentSteps,
  TaskRecording,
  MarkdownResult,
  InputForm,
  Suggestions,
} from '@/components/agent-ui';
import { createClient } from '@/utils/supabase/client';
import { useToast } from "@/hooks/use-toast";
import TemplateSection from '@/components/TemplateSection';
import { useGifContent } from '@/hooks/useGifContent';

interface ProgressEvent {
  type: 'start' | 'url' | 'action' | 'thought' | 'error' | 'complete' | 'gif' | 'section' | 'run_id';
  message?: string;
  content?: string;
  success?: boolean;
  title?: string;
  items?: string[];
}

// Add new interface for template events
interface TemplateFormEvent extends React.FormEvent {
  templateTask?: string;
}

export default function Home() {
  const [task, setTask] = useState('');
  const [submittedTask, setSubmittedTask] = useState('');
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [progress, setProgress] = useState<ProgressEvent[]>([]);
  const [result, setResult] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null);
  const [gifContent, setGifContent] = useState<string | undefined>(undefined);
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);
  const [shouldFetchGif, setShouldFetchGif] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const MAX_CHARS = 2000;
  const supabase = createClient();
  const { toast } = useToast();
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // React Query hook for fetching GIF content
  const { 
    data: gifData, 
    isLoading: isGifLoading, 
    error: gifError
  } = useGifContent(currentRunId, !!currentRunId && shouldFetchGif);

  // Update gifContent when gifData changes
  useEffect(() => {
    if (gifData?.gif_content) {
      setGifContent(gifData.gif_content);
      console.log('[GIF Fetch] Set GIF content successfully');
    } else if (gifData && !gifData.gif_content && shouldFetchGif) {
      console.warn('[GIF Fetch] Received data but no GIF content');
    }
  }, [gifData, shouldFetchGif]);

  // Log any GIF fetch errors
  useEffect(() => {
    if (gifError) {
      console.error('[GIF Fetch] Error:', gifError);
      
      // If the error is that the GIF is not ready yet, retry after a delay
      if (gifError instanceof Error && 
          gifError.message.includes('not ready yet') && 
          shouldFetchGif && 
          currentRunId) {
        const retryTimer = setTimeout(() => {
          console.log('[GIF Fetch] Retrying after delay...');
          // Force refetch by toggling the shouldFetchGif state
          setShouldFetchGif(false);
          setTimeout(() => setShouldFetchGif(true), 100);
        }, 5000); // 5 second delay before retry
        
        return () => clearTimeout(retryTimer);
      }
    }
  }, [gifError, shouldFetchGif, currentRunId]);

  // Detect mobile screen size and set right panel collapsed on mobile by default
  useEffect(() => {
    const checkIsMobile = () => {
      const mobileView = window.innerWidth < 768;
      setIsMobile(mobileView);
      if (mobileView) {
        setIsRightPanelCollapsed(true);
      }
    };
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Add scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      if (!resultsRef.current) return;
      
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const bottomThreshold = 200; // Show button when user is more than 200px from bottom
      const isNearBottom = scrollHeight - scrollTop - clientHeight <= bottomThreshold;
      setShowScrollButton(!isNearBottom);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [resultsRef]);

  const scrollToBottom = () => {
    resultsRef.current?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'end',
    });
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (task.trim() && !loading) {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast({
            variant: "destructive",
            title: "Authentication Required",
            description: "Please sign in to send messages.",
          });
          return;
        }
        
        const syntheticEvent = {
          preventDefault: () => {},
          target: e.target,
        } as React.FormEvent<HTMLFormElement>;
        handleSubmit(syntheticEvent);
      }
    }
  };


  const handleSubmit = async (e: TemplateFormEvent, sensitiveData?: Record<string, string>) => {
    e.preventDefault();
    const currentTask = e.templateTask || task;
    if (!currentTask.trim()) {
      console.warn('[Submit] Empty task submitted');
      return;
    }

    console.log('[Submit] Starting task submission:', {
      hasTemplateTask: !!e.templateTask,
      hasSensitiveData: !!sensitiveData
    });

    // Set the submitted task to display in the UI
    setSubmittedTask(currentTask);
    
    setLoading(true);
    setIsStreaming(true);
    setProgress([]);
    setResult(null);
    setError(null);
    setGifContent(undefined);
    setCurrentRunId(null);
    setShouldFetchGif(false);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error('[Submit] No active session found');
        toast({
          variant: "destructive",
          title: "Authentication Required",
          description: "Please sign in to send messages.",
        });
        return;
      }

      console.log('[Submit] Making API request');
      
      // Function to handle stream processing with retry capability
      const processStream = async (retryCount = 0, lastProgressCount = 0): Promise<void> => {
        const maxRetries = 3;
        
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/browse`, {
            keepalive: true,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
              'Connection': 'keep-alive',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              task: currentTask,
              sensitive_data: sensitiveData,
              retry_count: retryCount, // Let server know if this is a retry
              last_progress_count: lastProgressCount // Help server know where to resume from
            }),
          });

          if (!response.ok) {
            console.error('[Submit] API request failed:', {
              status: response.status,
              statusText: response.statusText
            });
            throw new Error(`Failed to start task: ${response.status} ${response.statusText}`);
          }

          const reader = response.body?.getReader();
          if (!reader) {
            console.error('[Submit] No response stream available');
            throw new Error('No response stream available');
          }

          let currentProgress: ProgressEvent[] = [...progress]; // Start with existing progress
          let buffer = ''; // Buffer for accumulating partial chunks
          console.log('[Submit] Starting to read stream');
          
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              console.log('[Submit] Stream completed');
              
              // Process any remaining data in the buffer
              if (buffer.trim()) {
                try {
                  const event = JSON.parse(buffer) as ProgressEvent;
                  currentProgress = [...currentProgress, event];
                  setProgress(currentProgress);
                } catch (e) {
                  console.error('[Submit] Error parsing final buffer:', {
                    error: e instanceof Error ? {
                      name: e.name,
                      message: e.message,
                      stack: e.stack
                    } : e,
                    buffer
                  });
                }
              }
              break;
            }

            // Convert the stream chunk to text and add to buffer
            const chunk = new TextDecoder().decode(value);
            buffer += chunk;

            // Try to process complete JSON objects from the buffer
            let startIdx = 0;
            while (true) {
              // Find the next newline character
              const endIdx = buffer.indexOf('\n', startIdx);
              if (endIdx === -1) break; // No more complete lines in buffer

              // Extract the complete line
              const line = buffer.slice(startIdx, endIdx).trim();
              if (line) {
                try {
                  const event = JSON.parse(line) as ProgressEvent;
                  console.log('[Submit] Received event:', { type: event.type, hasMessage: !!event.message });
                  
                  if (event.type === 'run_id') {
                    setCurrentRunId(event.message || null);
                    console.log('[Submit] Received run ID:', event.message);
                  } else if (event.type === 'error') {
                    console.error('[Submit] Error event received:', event.message);
                    setError(event.message || 'An error occurred');
                  } else if (event.type === 'complete') {
                    console.log('[Submit] Task completed');
                    setResult(event.message || null);
                    // Wait a moment to ensure GIF processing is complete before fetching
                    setTimeout(() => {
                      setShouldFetchGif(true);
                    }, 2000); // 2 second delay to allow GIF processing
                  } else if (event.type === 'gif') {
                    console.log('[Submit] GIF generation started');
                  }

                  currentProgress = [...currentProgress, event];
                  setProgress(currentProgress);
                } catch (e) {
                  console.error('[Submit] Error parsing event:', {
                    error: e instanceof Error ? {
                      name: e.name,
                      message: e.message,
                      stack: e.stack
                    } : e,
                    line
                  });
                }
              }
              startIdx = endIdx + 1;
            }

            // Keep any remaining partial data in the buffer
            buffer = buffer.slice(startIdx);
          }
        } catch (e) {
          // Handle network errors with retry logic
          if (
            e instanceof Error && 
            ['NetworkError', 'Failed to fetch', 'net::'].some(errType => 
              e.message.includes(errType) || e.toString().includes(errType)
            ) &&
            retryCount < maxRetries &&
            !progress.some(p => p.type === 'complete')
          ) {
            console.warn(`[Submit] Network error, retrying (${retryCount + 1}/${maxRetries})...`, e);
            // Wait before retry with exponential backoff
            const backoffMs = Math.min(1000 * Math.pow(2, retryCount), 10000);
            await new Promise(resolve => setTimeout(resolve, backoffMs));
            return processStream(retryCount + 1, progress.length);
          } else {
            // Propagate other errors
            throw e;
          }
        }
      };

      try {
        await processStream();
      } catch (e) {
        console.error('[Submit] Task execution error:', {
          error: e instanceof Error ? {
            name: e.name,
            message: e.message,
            stack: e.stack
          } : e,
          currentRunId
        });
        
        // Provide more informative error messages based on error type
        let errorMessage = 'An error occurred';
        if (e instanceof Error) {
          if (e.message.includes('QUIC_TOO_MANY_RTOS') || e.message.includes('ERR_QUIC_PROTOCOL_ERROR')) {
            errorMessage = 'Network issue detected. The response may be too large. Please try again with a more specific task.';
          } else if (e.message.includes('NetworkError')) {
            errorMessage = 'Network connection error. Please check your internet connection and try again.';
          } else {
            errorMessage = e.message;
          }
        }
        
        setError(errorMessage);
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage,
        });
      } finally {
        console.log('[Submit] Task execution completed');
        setLoading(false);
        setIsStreaming(false);
      }
    } catch (e) {
      // This outer catch block only handles session/authentication errors
      console.error('[Submit] Authentication or initialization error:', e);
      setError(e instanceof Error ? e.message : 'An authentication error occurred');
      toast({
        variant: "destructive",
        title: "Error",
        description: e instanceof Error ? e.message : 'An authentication error occurred',
      });
      setLoading(false);
      setIsStreaming(false);
    }
  };

  // Detect if screen size changes while on the recording view (mobile)
  // This prevents getting stuck in recording view when switching from mobile to desktop
  useEffect(() => {
    if (!isMobile && !isRightPanelCollapsed) {
      // Always make sure desktop shows the recording when available
      setIsRightPanelCollapsed(false);
    }
  }, [isMobile, isRightPanelCollapsed]);

  // Initial setup: Show recording panel by default on desktop when agent starts running
  useEffect(() => {
    if (!isMobile && loading && isStreaming) {
      setIsRightPanelCollapsed(false);
    }
  }, [isMobile, loading, isStreaming]);

  // Force layout recalculation when panel collapse state changes
  useEffect(() => {
    // Small delay to let state update complete
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 50);
    return () => clearTimeout(timer);
  }, [isRightPanelCollapsed]);

  // Handler for showing/hiding the recording panel
  const toggleRecordingPanel = () => {
    setIsRightPanelCollapsed(!isRightPanelCollapsed);
  };

  // Check if recording is available or potentially will be available
  const isRecordingRelevant = gifContent || isGifLoading || (loading && isStreaming);

  // Add function to handle direct download on mobile
  const handleMobileDownload = () => {
    if (!gifContent) {
      console.error('Download failed: No GIF content available');
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "No recording content available to download.",
      });
      return;
    }
    
    try {
      console.log('Starting download process...');
      
      // Handle both with and without data URL prefix
      let base64Content = gifContent;
      if (base64Content.includes('base64,')) {
        base64Content = base64Content.split('base64,')[1];
      }
      
      // Create a Blob directly from the base64 data
      const binaryString = window.atob(base64Content);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const blob = new Blob([bytes], { type: 'image/gif' });
      console.log('Blob created successfully:', blob.size, 'bytes');
      
      // Create download link
      const url = URL.createObjectURL(blob);
      console.log('Object URL created:', url);
      
      // Show feedback toast
      toast({
        title: "Download Started",
        description: "Your recording is being downloaded.",
      });
      
      // Use download attribute for more reliable downloading
      const a = document.createElement('a');
      a.href = url;
      a.download = 'task-recording.gif';
      a.style.display = 'none';
      document.body.appendChild(a);
      
      console.log('Triggering download click...');
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        console.log('Download cleanup complete');
      }, 1000); // Increased timeout for reliability
    } catch (e) {
      console.error('Download failed:', e);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: e instanceof Error ? e.message : "Failed to download the recording.",
      });
    }
  };

  // Render responsive layout 
  const renderDualPanelLayout = () => {
    // On mobile, no need to show recording panel anymore, just use download
    const showMobileTaskRecording = false; // Always false for mobile as we're downloading instead
    
    return (
      <div className={`relative ${showMobileTaskRecording ? 'overflow-hidden' : ''}`}>
        {/* Agent Interactions Panel */}
        <div className="visible">
          <div className="space-y-6 mb-6" ref={resultsRef} id="mobile-results-container">
            {submittedTask && <UserQuery task={submittedTask} />}

            <AgentSteps progress={progress} isStreaming={isStreaming} />

            {loading && <LoadingAnimation />}
            
            {/* Error messages removed as per requirements */}

            {result && (
              <div className="animate-in fade-in slide-in-from-bottom-2">
                <MarkdownResult content={result} />
              </div>
            )}
          </div>

          {/* Input Form */}
          <InputForm
            task={task}
            loading={loading}
            maxChars={MAX_CHARS}
            onSubmit={handleSubmit}
            onChange={(e) => setTask(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* Task Recording panel removed for mobile - using download button instead */}
      </div>
    );
  };

  // For desktop: show resizable panel layout
  const renderDesktopLayout = () => {
    return (
      <ResizablePanelGroup
        direction="horizontal"
        className="min-h-[200px]"
        onLayout={(sizes) => {
          // This callback ensures the panel sizes are properly applied
          console.log("Layout updated:", sizes);
        }}
      >
        {/* Left Panel - Agent Interactions */}
        <ResizablePanel 
          defaultSize={isRightPanelCollapsed ? 100 : 70}
          minSize={isRightPanelCollapsed ? 100 : 50}
          maxSize={isRightPanelCollapsed ? 100 : 70}
          className="p-6 bg-gradient-to-b from-white to-gray-50 rounded-lg shadow-sm border border-gray-100"
        >
          <div className="space-y-6 mb-6" ref={resultsRef} id="results-container">
            {submittedTask && <UserQuery task={submittedTask} />}

            <AgentSteps progress={progress} isStreaming={isStreaming} />

            {loading && <LoadingAnimation />}
            
            {/* Error messages removed as per requirements */}

            {result && (
              <div className="animate-in fade-in slide-in-from-bottom-2">
                <MarkdownResult content={result} />
              </div>
            )}
          </div>

          {/* Input Form */}
          <InputForm
            task={task}
            loading={loading}
            maxChars={MAX_CHARS}
            onSubmit={handleSubmit}
            onChange={(e) => setTask(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </ResizablePanel>

        {/* Always include the handle and right panel, but manage visibility with CSS */}
        <ResizableHandle 
          withHandle 
          className={`border-x border-gray-200 bg-transparent hover:bg-blue-50 transition-colors ${isRightPanelCollapsed ? 'opacity-0' : 'opacity-100'}`} 
        />

        {/* Right Panel - Task Recording - Always present in DOM but can be collapsed */}
        <ResizablePanel 
          id="rightPanel"
          defaultSize={isRightPanelCollapsed ? 0 : 30}
          minSize={isRightPanelCollapsed ? 0 : 5}
          maxSize={isRightPanelCollapsed ? 0 : 50}
          className={`transition-all duration-300 overflow-hidden ${isRightPanelCollapsed ? 'w-0 p-0 m-0 border-0' : 'p-6 bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-sm border border-gray-100'}`}
        >
          <div className={`sticky top-8 transition-opacity duration-300 h-[calc(100vh-8rem)] ${isRightPanelCollapsed ? 'opacity-0 invisible' : 'opacity-100 visible'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
              <button
                onClick={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                aria-label={isRightPanelCollapsed ? "Show recording panel" : "Hide recording panel"}
              >
                <IconLayoutColumns size={18} className="text-gray-600" />
              </button>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full px-4 py-2 shadow-sm border border-blue-100">
                <div className="flex items-center gap-2">
                  <IconPhoto size={18} className="text-blue-500" />
                  <span className="text-gray-900 font-medium">Task Recording</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden border border-gray-200 shadow-md h-[calc(100%-4rem)]">
              {isGifLoading ? (
                <div className="flex items-center justify-center py-20 bg-gradient-to-b from-gray-50 to-white h-full">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-gray-600 font-medium">Loading recording...</span>
                    {currentRunId && (
                      <span className="text-xs text-gray-500 mt-1">Run ID: {currentRunId}</span>
                    )}
                  </div>
                </div>
              ) : gifError && shouldFetchGif ? (
                <div className="flex flex-col items-center justify-center py-20 bg-gradient-to-b from-gray-50 to-white h-full">
                  <div className="flex flex-col items-center gap-3 max-w-md text-center px-4">
                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shadow-sm">
                      <IconPhoto size={24} className="text-amber-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Recording not ready</h3>
                    <p className="text-sm text-gray-600">
                      {gifError instanceof Error 
                        ? gifError.message.includes('not ready yet')
                          ? "We're still processing your recording. Please wait a moment."
                          : gifError.message
                        : "There was an issue loading the recording."}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => {
                        setShouldFetchGif(false);
                        setTimeout(() => setShouldFetchGif(true), 100);
                      }}
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : loading && isStreaming && !gifContent ? (
                <div className="flex flex-col items-center justify-center py-20 bg-gradient-to-b from-gray-50 to-white h-full">
                  <div className="flex flex-col items-center gap-3 max-w-md text-center px-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shadow-sm pulse-animation">
                      <IconPhoto size={24} className="text-blue-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Recording in progress</h3>
                    <p className="text-sm text-gray-600">
                      The agent is working on your task. A visual recording will appear here once it&apos;s ready.
                    </p>
                    {progress.length > 0 && (
                      <div className="w-32 h-1.5 mt-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: `${Math.min(progress.length * 5, 100)}%` }}></div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <TaskRecording 
                  gifContent={gifContent} 
                  isAgentRunning={loading && isStreaming} 
                />
              )}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    );
  };

  return (
    <div className={`container mx-auto px-4 py-4 mt-16 ${(progress.length > 0 || result || loading) ? 'max-w-7xl' : 'max-w-4xl'}`}>
      {/* Status Message */}
      {!(progress.length > 0 || result || loading) && (
        <div className="mb-4 md:mb-8 p-3 md:p-4 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 text-gray-600">
            <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
              <IconInfoCircle className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0 text-blue-500" />
            </div>
            <p className="text-sm md:text-base">Things might take a moment, but we&apos;re scaling up. Thanks for being part of the journey! 🚀</p>
          </div>
        </div>
      )}

      {/* Main Content - Responsive Layout */}
      {(progress.length > 0 || result || loading) ? (
        isMobile ? renderDualPanelLayout() : renderDesktopLayout()
      ) : (
        <div className="space-y-8">
          {submittedTask && <UserQuery task={submittedTask} />}
          <Suggestions />
          <InputForm
            task={task}
            loading={loading}
            maxChars={MAX_CHARS}
            onSubmit={handleSubmit}
            onChange={(e) => setTask(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <TemplateSection 
            onSubmit={(templateTask) => {
              setTask(templateTask);
              const event = { preventDefault: () => {}, templateTask } as TemplateFormEvent;
              handleSubmit(event);
            }} 
          />
        </div>
      )}

      {/* Floating Toggle Button for desktop when panel is collapsed */}
      {(!isMobile && isRightPanelCollapsed && isRecordingRelevant && (progress.length > 0 || result || loading)) && (
        <button
          onClick={toggleRecordingPanel}
          className="fixed top-12 right-8 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-blue-50 transition-colors border border-gray-200 z-50"
          aria-label="Show recording panel"
        >
          <IconPhoto size={20} className="text-blue-500" />
        </button>
      )}

      {/* Floating Download Button for mobile */}
      {(isMobile && gifContent && (progress.length > 0 || result || loading)) && (
        <button
          onClick={handleMobileDownload}
          className="fixed bottom-20 right-4 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-blue-50 transition-all duration-300 border border-gray-200 z-50 hover:scale-105"
          aria-label="Download recording"
          disabled={!gifContent}
        >
          <IconDownload size={24} className="text-blue-500" />
        </button>
      )}

      {/* Loading indicator for mobile when GIF is processing */}
      {(isMobile && isRecordingRelevant && !gifContent && (progress.length > 0 || result || loading)) && (
        <div
          className="fixed bottom-20 right-4 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center border border-gray-200 z-50 pulse-animation"
          aria-label="Recording in progress"
        >
          <IconPhoto size={24} className="text-blue-500" />
        </div>
      )}

      {/* Scroll to Bottom Button - Adjusted position for mobile */}
      {showScrollButton && (
        <Button
          variant="outline"
          size="icon"
          className={`fixed ${isMobile ? 'bottom-4' : 'bottom-8'} right-4 md:right-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-white hover:bg-blue-50 z-20 hover:scale-105`}
          onClick={scrollToBottom}
          aria-label="Scroll to bottom"
        >
          <IconArrowDown size={20} className="text-blue-500" />
        </Button>
      )}
      
      {/* Add a little CSS for custom animation */}
      <style jsx global>{`
        .pulse-animation {
          animation: custom-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes custom-pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
            box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
          }
        }
      `}</style>
    </div>
  );
}

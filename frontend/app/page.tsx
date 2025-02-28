'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import {  IconArrowDown, IconPhoto, IconLayoutColumns, IconInfoCircle } from '@tabler/icons-react';
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
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [progress, setProgress] = useState<ProgressEvent[]>([]);
  const [result, setResult] = useState<string | null>(null);
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/browse`, {
        keepalive: true,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'Connection': 'keep-alive'
        },
        body: JSON.stringify({
          task: currentTask,
          sensitive_data: sensitiveData
        }),
      });

      if (!response.ok) {
        console.error('[Submit] API request failed:', {
          status: response.status,
          statusText: response.statusText
        });
        throw new Error('Failed to start task');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        console.error('[Submit] No response stream available');
        throw new Error('No response stream available');
      }

      let currentProgress: ProgressEvent[] = [];
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
      console.error('[Submit] Task execution error:', {
        error: e instanceof Error ? {
          name: e.name,
          message: e.message,
          stack: e.stack
        } : e,
        currentRunId
      });
      setError(e instanceof Error ? e.message : 'An error occurred');
      toast({
        variant: "destructive",
        title: "Error",
        description: e instanceof Error ? e.message : 'An error occurred',
      });
    } finally {
      console.log('[Submit] Task execution completed');
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

  // Handler for showing/hiding the recording panel
  const toggleRecordingPanel = () => {
    setIsRightPanelCollapsed(!isRightPanelCollapsed);
  };

  // Check if recording is available or potentially will be available
  const isRecordingRelevant = gifContent || isGifLoading || (loading && isStreaming);

  // Render responsive layout 
  const renderDualPanelLayout = () => {
    const showMobileTaskRecording = isMobile && !isRightPanelCollapsed;
    
    return (
      <div className={`relative ${showMobileTaskRecording ? 'overflow-hidden' : ''}`}>
        {/* Agent Interactions Panel */}
        <div className={`${showMobileTaskRecording ? 'invisible h-0 overflow-hidden' : 'visible'}`}>
          <div className="space-y-6" ref={resultsRef} id="mobile-results-container">
            {task && <UserQuery task={task} />}

            <AgentSteps progress={progress} isStreaming={isStreaming} />

            {loading && <LoadingAnimation />}
            
            {error && (
              <div className="mb-4 px-4 py-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                {error}
              </div>
            )}

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

        {/* Task Recording - Full screen on mobile when visible */}
        {(!isRightPanelCollapsed || showMobileTaskRecording) && (
          <div 
            className={`${isMobile ? 'fixed inset-0 z-50 bg-white p-4' : ''} 
              ${isRightPanelCollapsed && !isMobile ? 'hidden' : 'block'}`}
          >
            <div className={`${isMobile ? 'h-full' : 'sticky top-8'} transition-opacity duration-300 ${isMobile ? '' : 'h-[calc(100vh-8rem)]'}`}>
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
                  className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  aria-label={isRightPanelCollapsed ? "Show recording panel" : "Hide recording panel"}
                >
                  <IconLayoutColumns size={18} className="text-gray-600" />
                </button>
                <div className="bg-white rounded-full px-4 py-2 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2">
                    <IconPhoto size={18} className="text-blue-500" />
                    <span className="text-gray-900 font-medium">Task Recording</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl overflow-hidden border border-gray-100 shadow-sm h-[calc(100%-4rem)]">
                {isGifLoading ? (
                  <div className="flex items-center justify-center py-20 bg-gray-50 h-full">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-gray-600">Loading recording...</span>
                      {currentRunId && (
                        <span className="text-xs text-gray-500 mt-1">Run ID: {currentRunId}</span>
                      )}
                    </div>
                  </div>
                ) : gifError && shouldFetchGif ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-gray-50 h-full">
                    <div className="flex flex-col items-center gap-3 max-w-md text-center px-4">
                      <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
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
                  <div className="flex flex-col items-center justify-center py-20 bg-gray-50 h-full">
                    <div className="flex flex-col items-center gap-3 max-w-md text-center px-4">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <IconPhoto size={24} className="text-blue-500" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">Recording in progress</h3>
                      <p className="text-sm text-gray-600">
                        The agent is working on your task. A visual recording will appear here once it&apos;s ready.
                      </p>
                      {progress.length > 0 && (
                        <div className="w-16 h-1 mt-2 bg-gray-200 rounded-full overflow-hidden">
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
          </div>
        )}
      </div>
    );
  };

  // For desktop: show resizable panel layout
  const renderDesktopLayout = () => {
    return (
      <ResizablePanelGroup
        direction="horizontal"
        className="min-h-[200px]"
      >
        {/* Left Panel - Agent Interactions */}
        <ResizablePanel 
          defaultSize={70}
          minSize={50}
          maxSize={isRightPanelCollapsed ? 100 : 70}
          className="p-4"
        >
          <div className="space-y-6" ref={resultsRef} id="results-container">
            {task && <UserQuery task={task} />}

            <AgentSteps progress={progress} isStreaming={isStreaming} />

            {loading && <LoadingAnimation />}
            
            {/* Error messages are hidden as per requirements */}

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

        <ResizableHandle 
          withHandle 
          className="border-x border-gray-200 bg-transparent hover:bg-gray-100 transition-colors" 
        />

        {/* Right Panel - Task Recording */}
        <ResizablePanel 
          defaultSize={30}
          minSize={10}
          maxSize={50}
          className={`transition-all duration-300 ${isRightPanelCollapsed ? 'invisible w-0 p-0' : 'visible p-4'}`}
        >
          <div className={`sticky top-8 ${isRightPanelCollapsed ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 h-[calc(100vh-8rem)]`}>
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                aria-label={isRightPanelCollapsed ? "Show recording panel" : "Hide recording panel"}
              >
                <IconLayoutColumns size={18} className="text-gray-600" />
              </button>
              <div className="bg-white rounded-full px-4 py-2 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2">
                  <IconPhoto size={18} className="text-blue-500" />
                  <span className="text-gray-900 font-medium">Task Recording</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden border border-gray-100 shadow-sm h-[calc(100%-4rem)]">
              {isGifLoading ? (
                <div className="flex items-center justify-center py-20 bg-gray-50 h-full">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-gray-600">Loading recording...</span>
                    {currentRunId && (
                      <span className="text-xs text-gray-500 mt-1">Run ID: {currentRunId}</span>
                    )}
                  </div>
                </div>
              ) : gifError && shouldFetchGif ? (
                <div className="flex flex-col items-center justify-center py-20 bg-gray-50 h-full">
                  <div className="flex flex-col items-center gap-3 max-w-md text-center px-4">
                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
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
                <div className="flex flex-col items-center justify-center py-20 bg-gray-50 h-full">
                  <div className="flex flex-col items-center gap-3 max-w-md text-center px-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <IconPhoto size={24} className="text-blue-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Recording in progress</h3>
                    <p className="text-sm text-gray-600">
                      The agent is working on your task. A visual recording will appear here once it&apos;s ready.
                    </p>
                    {progress.length > 0 && (
                      <div className="w-16 h-1 mt-2 bg-gray-200 rounded-full overflow-hidden">
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
        <div className="mb-4 md:mb-8 p-3 md:p-4 bg-white rounded-lg border border-gray-100">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 text-gray-600">
            <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <IconInfoCircle className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0 text-gray-600" />
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
          {task && <UserQuery task={task} />}
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
          className="fixed top-12 right-8 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-100 z-50"
          aria-label="Show recording panel"
        >
          <IconPhoto size={20} className="text-blue-500" />
        </button>
      )}

      {/* Floating Toggle Button for mobile when panel is collapsed */}
      {(isRightPanelCollapsed && isMobile && isRecordingRelevant && (progress.length > 0 || result || loading)) && (
        <button
          onClick={toggleRecordingPanel}
          className="fixed bottom-20 right-4 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-100 z-50"
          aria-label="Show recording panel"
        >
          <IconPhoto size={20} className="text-blue-500" />
        </button>
      )}

      {/* Scroll to Bottom Button - Adjusted position for mobile */}
      {showScrollButton && (
        <Button
          variant="outline"
          size="icon"
          className={`fixed ${isMobile ? 'bottom-4' : 'bottom-8'} right-4 md:right-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-white hover:bg-gray-50 z-20`}
          onClick={scrollToBottom}
          aria-label="Scroll to bottom"
        >
          <IconArrowDown size={20} className="text-gray-600" />
        </Button>
      )}
    </div>
  );
}

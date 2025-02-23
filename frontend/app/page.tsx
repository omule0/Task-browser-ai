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
  const [isGifLoading, setIsGifLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const MAX_CHARS = 2000;
  const supabase = createClient();
  const { toast } = useToast();
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);

  // Fetch user's email on component mount
  useEffect(() => {
    const fetchUserEmail = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    };
    fetchUserEmail();
  }, [supabase.auth]);

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

  const fetchGifContent = async (runId: string) => {
    try {
      setIsGifLoading(true);
      console.log('[GIF Fetch] Starting fetch for run ID:', runId);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('[GIF Fetch] No session available for GIF fetch');
        setIsGifLoading(false);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/history/${runId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        console.error('[GIF Fetch] Failed to fetch GIF content:', {
          status: response.status,
          statusText: response.statusText
        });
        throw new Error('Failed to fetch GIF content');
      }

      const data = await response.json();
      console.log('[GIF Fetch] Received history data:', { 
        hasGifContent: !!data.gif_content,
        gifContentLength: data.gif_content ? data.gif_content.length : 0 
      });
      
      if (data.gif_content) {
        setGifContent(data.gif_content);
        console.log('[GIF Fetch] Set GIF content successfully');
      } else {
        console.warn('[GIF Fetch] No GIF content in response');
      }
    } catch (error) {
      console.error('[GIF Fetch] Error:', error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error);
    } finally {
      setIsGifLoading(false);
    }
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

  const handleReset = () => {
    setTask('');
    setProgress([]);
    setResult(null);
    setError(null);
    setGifContent(undefined);
    setIsGifLoading(false);
  };

  const handleSubmit = async (e: TemplateFormEvent, sensitiveData?: Record<string, string>, email?: string | null) => {
    e.preventDefault();
    const currentTask = e.templateTask || task;
    if (!currentTask.trim()) {
      console.warn('[Submit] Empty task submitted');
      return;
    }

    console.log('[Submit] Starting task submission:', {
      hasTemplateTask: !!e.templateTask,
      hasSensitiveData: !!sensitiveData,
      hasEmail: !!email
    });

    setLoading(true);
    setIsStreaming(true);
    setProgress([]);
    setResult(null);
    setError(null);
    setGifContent(undefined);
    setIsGifLoading(false);

    let currentRunId: string | null = null;

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
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          task: currentTask,
          sensitive_data: sensitiveData,
          email,
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
      console.log('[Submit] Starting to read stream');
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log('[Submit] Stream completed');
          break;
        }

        // Convert the stream chunk to text
        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const event = JSON.parse(line) as ProgressEvent;
            console.log('[Submit] Received event:', { type: event.type, hasMessage: !!event.message });
            
            if (event.type === 'run_id') {
              currentRunId = event.message || null;
              console.log('[Submit] Received run ID:', currentRunId);
            } else if (event.type === 'error') {
              console.error('[Submit] Error event received:', event.message);
              setError(event.message || 'An error occurred');
            } else if (event.type === 'complete') {
              console.log('[Submit] Task completed');
              setResult(event.message || null);
              // Start fetching GIF after completion
              if (currentRunId) {
                console.log('[Submit] Initiating GIF fetch for run:', currentRunId);
                await fetchGifContent(currentRunId);
              }
            } else if (event.type === 'gif') {
              console.log('[Submit] GIF generation started');
              setIsGifLoading(true);
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

  return (
    <div className={`container mx-auto px-4 py-4 mt-16 ${(progress.length > 0 || result || loading) ? 'max-w-7xl' : 'max-w-4xl'}`}>
      {/* Status Message */}
      {!(progress.length > 0 || result || loading) && (
        <div className="mb-8 p-4 bg-white rounded-lg border border-gray-100">
          <div className="flex items-center gap-2 text-gray-600">
            <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
              <IconInfoCircle className="h-5 w-5 flex-shrink-0 text-gray-600" />
            </div>
            <p>Things might take a moment, but we&apos;re scaling up. Thanks for being part of the journey! 🚀</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      {(progress.length > 0 || result || loading) ? (
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
            <div className="space-y-6" ref={resultsRef}>
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
              defaultEmail={userEmail}
            />
          </ResizablePanel>

          <ResizableHandle withHandle className="border-x border-gray-200 bg-transparent hover:bg-gray-100 transition-colors" />

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
                      <span className="text-sm text-gray-600">Loading view...</span>
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
            defaultEmail={userEmail}
          />
          <TemplateSection 
            onSubmit={(templateTask) => {
              setTask(templateTask);
              const event = { preventDefault: () => {}, templateTask } as TemplateFormEvent;
              handleSubmit(event, undefined, userEmail);
            }} 
          />
        </div>
      )}

      {/* Floating Toggle Button */}
      {isRightPanelCollapsed && (gifContent || isGifLoading) && (progress.length > 0 || result || loading) && (
        <button
          onClick={() => setIsRightPanelCollapsed(false)}
          className="fixed top-12 right-8 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-100"
          aria-label="Show recording panel"
        >
          <IconPhoto size={20} className="text-blue-500" />
        </button>
      )}

      {/* Scroll to Bottom Button */}
      {showScrollButton && (
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-8 right-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-white hover:bg-gray-50"
          onClick={scrollToBottom}
          aria-label="Scroll to bottom"
        >
          <IconArrowDown size={20} className="text-gray-600" />
        </Button>
      )}
    </div>
  );
}

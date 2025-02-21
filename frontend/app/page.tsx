'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { IconRocket, IconEye, IconEyeOff, IconRefresh, IconArrowDown } from '@tabler/icons-react';
import { 
  LoadingAnimation,
  UserQuery,
  AgentSteps,
  TaskRecording,
  MarkdownResult,
  Suggestions,
  InputForm,
  TaskComplexityCard
} from '@/components/agent-ui';
import LoginButton from '@/components/LoginLogoutButton';
import UserGreetText from '@/components/UserGreetText';
import { createClient } from '@/utils/supabase/client';
import { useToast } from "@/hooks/use-toast";

interface ProgressEvent {
  type: 'start' | 'url' | 'action' | 'thought' | 'error' | 'complete' | 'gif' | 'section' | 'run_id';
  message?: string;
  content?: string;
  success?: boolean;
  title?: string;
  items?: string[];
}

export default function Home() {
  const [task, setTask] = useState('');
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [progress, setProgress] = useState<ProgressEvent[]>([]);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [gifContent, setGifContent] = useState<string | null>(null);
  const [isGifLoading, setIsGifLoading] = useState(false);
  const [showSteps, setShowSteps] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const MAX_CHARS = 2000;
  const supabase = createClient();
  const { toast } = useToast();

  // Auto-scroll during streaming
  useEffect(() => {
    if (isStreaming && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [progress, isStreaming]);

  // Auto-hide steps when result is displayed
  useEffect(() => {
    if (result) {
      setShowSteps(false);
    }
  }, [result]);

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
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > bottomThreshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [resultsRef]);

  const scrollToBottom = () => {
    if (resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };

  const fetchGifContent = async (runId: string) => {
    try {
      setIsGifLoading(true);
      console.log('Fetching GIF content for run ID:', runId);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('No session available for GIF fetch');
        setIsGifLoading(false);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/history/${runId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch GIF content');
      }

      const data = await response.json();
      console.log('Received history data:', { 
        hasGifContent: !!data.gif_content,
        gifContentLength: data.gif_content ? data.gif_content.length : 0 
      });
      
      if (data.gif_content) {
        setGifContent(data.gif_content);
        console.log('Set GIF content successfully');
      }
    } catch (error) {
      console.error('Error fetching GIF:', error);
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
    setGifContent(null);
    setIsGifLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent, sensitiveData?: Record<string, string>, email?: string | null) => {
    e.preventDefault();
    if (!task.trim()) return;

    setLoading(true);
    setIsStreaming(true);
    setProgress([]);
    setResult(null);
    setError(null);
    setGifContent(null);
    setIsGifLoading(false);

    let currentRunId: string | null = null;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          variant: "destructive",
          title: "Authentication Required",
          description: "Please sign in to send messages.",
        });
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/browse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          task,
          sensitive_data: sensitiveData,
          email,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start task');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response stream available');
      }

      let currentProgress: ProgressEvent[] = [];
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Convert the stream chunk to text
        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const event = JSON.parse(line) as ProgressEvent;
            
            if (event.type === 'run_id') {
              currentRunId = event.message || null;
            } else if (event.type === 'error') {
              setError(event.message || 'An error occurred');
            } else if (event.type === 'complete') {
              setResult(event.message || null);
              // Start fetching GIF after completion
              if (currentRunId) {
                await fetchGifContent(currentRunId);
              }
            } else if (event.type === 'gif') {
              setIsGifLoading(true);
            }

            currentProgress = [...currentProgress, event];
            setProgress(currentProgress);
          } catch (e) {
            console.error('Error parsing event:', e);
          }
        }
      }
    } catch (e) {
      console.error('Error:', e);
      setError(e instanceof Error ? e.message : 'An error occurred');
      toast({
        variant: "destructive",
        title: "Error",
        description: e instanceof Error ? e.message : 'An error occurred',
      });
    } finally {
      setLoading(false);
      setIsStreaming(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header Section */}
      <header className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <UserGreetText />
          <LoginButton />
        </div>
      </header>

      <div className="w-full space-y-8">
        {/* Header and Suggestions - Only show when no active conversation */}
        {!progress.length && !result && !loading && (
          <Suggestions onSelectTask={setTask} />
        )}

        {/* Results Area */}
        {(progress.length > 0 || result || loading) && (
          <div className="space-y-6" ref={resultsRef}>
            {task && <UserQuery task={task} />}
            
            {/* Task Complexity Info */}
            <TaskComplexityCard />
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <IconRocket size={18} className="text-primary" />
                <h2 className="text-lg font-semibold">Results</h2>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={handleReset}
                >
                  <IconRefresh size={16} />
                  <span className="ml-2 text-sm">Refresh chat</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={() => setShowSteps(!showSteps)}
                >
                  {showSteps ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                  <span className="ml-2 text-sm">
                    {showSteps ? 'Hide steps' : 'Show steps'}
                  </span>
                </Button>
              </div>
            </div>

            {showSteps && <AgentSteps progress={progress} isStreaming={isStreaming} />}

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

            {isGifLoading && (
              <div className="flex items-center justify-center py-4">
                <span className="ml-2 text-sm text-muted-foreground">Loading recording...</span>
              </div>
            )}

            {gifContent && <TaskRecording gifContent={gifContent} />}
          </div>
        )}

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

        {/* Scroll to Bottom Button */}
        {showScrollButton && (
          <Button
            variant="outline"
            size="icon"
            className="fixed bottom-8 right-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={scrollToBottom}
          >
            <IconArrowDown size={20} />
          </Button>
        )}
      </div>
    </div>
  );
}

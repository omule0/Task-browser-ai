'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { IconRocket, IconEye, IconEyeOff, IconRefresh } from '@tabler/icons-react';
import { 
  LoadingAnimation,
  UserQuery,
  AgentSteps,
  TaskRecording,
  MarkdownResult,
  Suggestions,
  InputForm
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
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<ProgressEvent[]>([]);
  const [gifContent, setGifContent] = useState<string | null>(null);
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);
  const [showSteps, setShowSteps] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const MAX_CHARS = 2000;
  const supabase = createClient();
  const { toast } = useToast();

  // Fetch user's email on component mount
  useEffect(() => {
    const fetchUserEmail = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    };
    fetchUserEmail();
  }, []);

  const fetchGifContent = async (runId: string) => {
    try {
      console.log('Fetching GIF content for run ID:', runId);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('No session available for GIF fetch');
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
      } else {
        console.warn('No GIF content in response');
      }
    } catch (error) {
      console.error('Error fetching GIF:', error);
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

  const handleSubmit = async (e: React.FormEvent, sensitiveData?: Record<string, string>, email?: string | null) => {
    e.preventDefault();
    if (!task.trim() || loading) return;
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please sign in to send messages.",
      });
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setProgress([]);
    setGifContent(null);
    setCurrentRunId(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/browse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ 
          task,
          sensitive_data: sensitiveData,
          email: email || undefined // Only include email if it's provided
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch results');
      }

      // Show toast if email notifications are enabled
      if (email) {
        toast({
          title: "Email Notifications Enabled",
          description: "You will receive an email when the task is complete.",
        });
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let currentRunIdTemp: string | null = null;  // Temporary variable to track run ID

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const events = chunk.split('\n').filter(Boolean);

        for (const eventText of events) {
          try {
            const event: ProgressEvent = JSON.parse(eventText);
            console.log('Stream Event:', event);
            setProgress(prev => [...prev, event]);

            // Handle run_id event first
            if (event.type === 'run_id') {
              console.log('Received run ID:', event.message);
              currentRunIdTemp = event.message || null;  // Store in temp variable
              setCurrentRunId(event.message || null);
            }
            // Handle other events
            else if (event.type === 'complete') {
              console.log('Complete Event:', event.message);
              setResult(event.message || null);
              setLoading(false);
              setTask(''); // Clear input after completion
              
              // Use the temp variable instead of the state
              if (currentRunIdTemp) {
                console.log('Initiating GIF fetch for run ID:', currentRunIdTemp);
                await fetchGifContent(currentRunIdTemp);
              } else {
                console.warn('No run ID available after completion');
              }
            } else if (event.type === 'error') {
              console.log('Error Event:', event.message);
              setError(event.message || null);
              setLoading(false);
            }
          } catch (e) {
            console.error('Failed to parse event:', e);
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  const handleReset = () => {
    setProgress([]);
    setResult(null);
    setError(null);
    setGifContent(null);
    setCurrentRunId(null);
    setTask('');
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
          <div className="space-y-6">
            {task && <UserQuery task={task} />}
            
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

            {showSteps && <AgentSteps progress={progress} />}

            {loading && <LoadingAnimation />}
            
            {error && (
              <div className="mb-4 px-4 py-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                {error}
              </div>
            )}

            {result && <MarkdownResult content={result} />}

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
      </div>
    </div>
  );
}

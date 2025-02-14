'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { IconRocket, IconEye, IconEyeOff } from '@tabler/icons-react';
import { Sidebar } from "@/components/ui/sidebar";
import { 
  LoadingAnimation,
  UserQuery,
  AgentSteps,
  TaskRecording,
  MarkdownResult,
  Suggestions,
  InputForm
} from '@/components/agent-ui';
import { cn } from '@/lib/utils';

interface ProgressEvent {
  type: 'start' | 'url' | 'action' | 'thought' | 'error' | 'complete' | 'gif' | 'section';
  message?: string;
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
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [showSteps, setShowSteps] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const MAX_CHARS = 2000;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (task.trim() && !loading) {
        const syntheticEvent = {
          preventDefault: () => {},
          target: e.target,
        } as React.FormEvent<HTMLFormElement>;
        handleSubmit(syntheticEvent);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent, sensitiveData?: Record<string, string>) => {
    e.preventDefault();
    if (!task.trim() || loading) return;
    
    setLoading(true);
    setError(null);
    setResult(null);
    setProgress([]);
    setGifUrl(null);

    try {
      const response = await fetch('http://localhost:8000/api/browse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          task,
          sensitive_data: sensitiveData 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch results');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const events = chunk.split('\n').filter(Boolean);

        for (const eventText of events) {
          try {
            const event: ProgressEvent = JSON.parse(eventText);
            setProgress(prev => [...prev, event]);

            if (event.type === 'complete') {
              setResult(event.message || null);
              setLoading(false);
              setTask(''); // Clear input after completion
            } else if (event.type === 'error') {
              setError(event.message || null);
              setLoading(false);
            } else if (event.type === 'gif') {
              setGifUrl(event.message ? `http://localhost:8000${event.message}` : null);
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

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={setIsSidebarCollapsed} />
      <main className={cn(
        "flex-1 w-full transition-all duration-300",
        "md:ml-0", // Remove margin on desktop as sidebar is sticky
        isSidebarCollapsed ? "ml-[60px]" : "ml-[200px]" // Add margin on mobile to prevent overlap
      )}>
        <div className="container mx-auto max-w-4xl px-4 py-8">
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

                {showSteps && <AgentSteps progress={progress} />}

              {loading && <LoadingAnimation />}
              
              {error && (
                  <div className="mb-4 px-4 py-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                  {error}
                </div>
              )}

                {result && <MarkdownResult content={result} />}

                {gifUrl && <TaskRecording gifUrl={gifUrl} />}
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
                />
                </div>
              </div>
      </main>
    </div>
  );
}

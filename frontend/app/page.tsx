'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { 
  IconHexagon,
  IconSend,
  IconPrompt,
  IconRocket,
  IconWorld,
  IconTarget,
  IconBrain,
  IconX,
  IconCheck,
  IconVideo,
  IconSearch,
  IconSourceCode,
  IconWriting,
  IconEye,
  IconEyeOff,
  IconUser
} from '@tabler/icons-react';

interface ProgressEvent {
  type: 'start' | 'url' | 'action' | 'thought' | 'error' | 'complete' | 'gif';
  message: string;
  success?: boolean;
}

const suggestions = [
  { title: 'Stock market analysis of Nvidia', onClick: () => {} },
  { title: 'Go to amazon and search for valentines day gifts', onClick: () => {} },
  { title: 'Using reddit what is the best way to learn about AI', onClick: () => {} },
  { title: 'What is the weather in tokyo', onClick: () => {} },
  { title: 'Search for software jobs in kampala', onClick: () => {} },
];

const getEventIcon = (type: ProgressEvent['type']) => {
  switch (type) {
    case 'start':
      return <IconRocket size={18} className="inline-block" />;
    case 'url':
      return <IconWorld size={18} className="inline-block" />;
    case 'action':
      return <IconTarget size={18} className="inline-block" />;
    case 'thought':
      return <IconBrain size={18} className="inline-block" />;
    case 'error':
      return <IconX size={18} className="inline-block" />;
    case 'complete':
      return <IconCheck size={18} className="inline-block" />;
    case 'gif':
      return <IconVideo size={18} className="inline-block" />;
    default:
      return null;
  }
};

const getStepIcon = (step: string) => {
  switch (step) {
    case 'searching':
      return <IconSearch size={18} className="inline-block" />;
    case 'sources':
      return <IconSourceCode size={18} className="inline-block" />;
    case 'writing':
      return <IconWriting size={18} className="inline-block" />;
    default:
      return null;
  }
};

const LoadingAnimation = () => (
  <div className="flex items-center justify-center p-8">
    <div className="w-20 h-20">
      <DotLottieReact
        src="/loading-gif.json"
        loop
        autoplay
      />
    </div>
  </div>
);

export default function Home() {
  const [task, setTask] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<ProgressEvent[]>([]);
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [showSteps, setShowSteps] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
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
        body: JSON.stringify({ task }),
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
              setResult(event.message);
              setLoading(false);
              setTask(''); // Clear input after completion
            } else if (event.type === 'error') {
              setError(event.message);
              setLoading(false);
            } else if (event.type === 'gif') {
              setGifUrl(`http://localhost:8000${event.message}`);
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

  const renderUserQuery = () => (
    <div className="flex items-start gap-3 mb-6">
      <div className="w-8 h-8 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
        <IconUser size={20} className="text-primary" />
      </div>
      <div className="flex-1">
        <p className="text-base">{task}</p>
      </div>
    </div>
  );

  const renderSteps = () => {
    const uniqueEvents = progress.reduce((acc: ProgressEvent[], event) => {
      if (!acc.find(e => e.type === event.type)) {
        acc.push(event);
      }
      return acc;
    }, []);

    return (
      <div className="space-y-2 mb-4">
        {uniqueEvents.map((event, index) => (
          <div 
            key={index} 
            className={`flex items-center gap-2 text-sm ${
              event.type === 'error' 
                ? 'text-destructive' 
                : event.type === 'complete'
                ? 'text-primary'
                : 'text-muted-foreground'
            }`}
          >
            <span className="w-5 h-5">{getEventIcon(event.type)}</span>
            <span>{event.message}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header and Suggestions - Only show when no active conversation */}
        {!progress.length && !result && !loading && (
          <>
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                <IconHexagon className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">What&apos;s Your Task</h1>
              <p className="text-muted-foreground">
                Choose a task below or write your own to start chatting with Seam
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-medium text-muted-foreground">Ask about:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="text-sm"
                    onClick={() => setTask(suggestion.title)}
                  >
                    {suggestion.title}
                  </Button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Results Area */}
        {(progress.length > 0 || result || loading) && (
          <div className="space-y-6">
            {task && renderUserQuery()}
            
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

            {showSteps && renderSteps()}

            <ScrollArea className="rounded-lg border bg-muted/50 p-4">
              {loading && <LoadingAnimation />}
              
              {error && (
                <Card className="mb-4 p-4 bg-destructive/10 text-destructive">
                  {error}
                </Card>
              )}

              {result && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {result}
                  </p>
                </div>
              )}

              {gifUrl && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Task Recording</h3>
                  <div className="rounded-lg overflow-hidden border">
                    <img src={gifUrl} alt="Task Recording" className="w-full" />
                  </div>
                </div>
              )}
            </ScrollArea>
          </div>
        )}

        {/* Input Form */}
        <Card className="p-0 shadow-none bg-muted/50">
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-end">
              <div className="flex-1 relative">
                <div className="absolute left-4 top-4 opacity-50">
                  <IconPrompt size={18} />
                </div>
                <Textarea
                  placeholder={loading ? "Processing..." : "Ask AI a question or make a request..."}
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                  className={`min-h-[120px] resize-none pl-12 pr-20 py-4 bg-transparent border-0 focus-visible:ring-0 text-base ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  maxLength={MAX_CHARS}
                />
                <div className="absolute bottom-3 right-4 text-xs text-muted-foreground">
                  {task.length}/{MAX_CHARS}
                </div>
              </div>
            </div>
            <Button
              type="submit"
              size="icon"
              disabled={loading || task.length === 0}
              className={`absolute bottom-3 right-12 h-8 w-8 bg-transparent hover:bg-muted text-muted-foreground hover:text-foreground ${
                loading ? 'cursor-not-allowed opacity-50' : ''
              }`}
            >
              <IconSend size={18} />
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { LoadingAnimation, AgentSteps, MarkdownResult } from "@/components/agent-ui";
import { IconAlertTriangle, IconClipboard, IconCheck } from '@tabler/icons-react';
import { createClient } from '@/utils/supabase/client';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from 'date-fns';

interface TaskDetailContentProps {
  historyId: string | null;
}

interface ProgressEvent {
  type: string;
  message?: string;
  content?: string;
  success?: boolean;
  title?: string;
  items?: string[];
}

interface HistoryDetailData {
  id: string;
  created_at: string;
  task_name: string;
  task_description: string;
  status: string;
  result: string;
  task: string;
  progress: string | ProgressEvent[];
  steps: Array<{
    id: string;
    step_number: number;
    description: string;
    status: string;
    result?: string;
  }>;
  error?: string;
}

export function TaskDetailContent({ historyId }: TaskDetailContentProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<HistoryDetailData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    if (!historyId) {
      setData(null);
      setError(null);
      return;
    }

    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('You must be logged in to view task details');
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/history/${historyId}`,
          {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch task details');
        }

        const historyData = await response.json();
        setData(historyData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        toast({
          variant: "destructive",
          title: "Error",
          description: err instanceof Error ? err.message : 'Failed to fetch task details',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [historyId, supabase.auth, toast]);

  const handleCopyTask = async () => {
    if (!data?.task) return;
    
    try {
      await navigator.clipboard.writeText(data.task);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy task:', err);
    }
  };

  if (!historyId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
        <p>Select a task to view details</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingAnimation />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Alert variant="destructive" className="max-w-md">
          <IconAlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading Details</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!data) return null;

  let progress;
  try {
    progress = typeof data.progress === 'string' ? JSON.parse(data.progress) : data.progress;
  } catch (e) {
    console.error('Error parsing progress:', e);
    progress = [];
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-8 p-6">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Task Details</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Created {formatDistanceToNow(new Date(data.created_at), { addSuffix: true })}
                </p>
              </div>
              <Badge variant={data.error ? "destructive" : data.result ? "default" : "secondary"}>
                {data.error ? "Failed" : data.result ? "Completed" : "In Progress"}
              </Badge>
            </div>
          </div>

          {/* Task */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Task</h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={handleCopyTask}
              >
                {copied ? (
                  <IconCheck size={16} className="mr-1" />
                ) : (
                  <IconClipboard size={16} className="mr-1" />
                )}
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-sm">{data.task}</p>
            </div>
          </div>

          {/* Error */}
          {data.error && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-destructive">Error</h3>
              <Alert variant="destructive">
                <IconAlertTriangle className="h-4 w-4" />
                <AlertTitle>Task Failed</AlertTitle>
                <AlertDescription className="mt-2">
                  {data.error}
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Progress */}
          {progress && progress.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Progress</h3>
              <div className="rounded-lg border p-4">
                <AgentSteps progress={progress} />
              </div>
            </div>
          )}

          {/* Result */}
          {data.result && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Result</h3>
              <div className="rounded-lg border p-4">
                <MarkdownResult content={data.result} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
import { LoadingAnimation, AgentSteps, MarkdownResult } from "@/components/agent-ui";
import { IconAlertTriangle, IconClipboard, IconCheck } from '@tabler/icons-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from 'date-fns';
import { useHistoryDetail } from '@/hooks/useHistory';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';

interface TaskDetailContentProps {
  historyId: string | null;
}

export function TaskDetailContent({ historyId }: TaskDetailContentProps) {
  const { 
    data,
    isLoading,
    isError,
    error
  } = useHistoryDetail(historyId || '');
  
  const { copied, copyToClipboard } = useCopyToClipboard();

  const handleCopyTask = () => {
    if (data?.task) {
      copyToClipboard(data.task);
    }
  };

  if (!historyId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
        <p>Select a task to view details</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingAnimation />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Alert variant="destructive" className="max-w-md">
          <IconAlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading Details</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'An error occurred'}
          </AlertDescription>
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
            <div className="text-sm pl-4">
              {data.task}
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
              <div className="pl-4">
                <AgentSteps progress={progress} />
              </div>
            </div>
          )}

          {/* Result */}
          {data.result && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Result</h3>
              <div className="pl-4">
                <MarkdownResult content={data.result} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
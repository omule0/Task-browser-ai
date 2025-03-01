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
      <div className="flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] text-muted-foreground text-sm sm:text-base">
        <p>Select a task to view details</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
        <LoadingAnimation />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] p-4">
        <Alert variant="destructive" className="max-w-[340px] sm:max-w-md">
          <IconAlertTriangle className="h-4 w-4" />
          <AlertTitle className="text-sm sm:text-base">Error Loading Details</AlertTitle>
          <AlertDescription className="text-xs sm:text-sm">
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
        <div className="space-y-6 sm:space-y-8 p-4 sm:p-6">
          {/* Header */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">Task Details</h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Created {formatDistanceToNow(new Date(data.created_at), { addSuffix: true })}
                </p>
              </div>
              <Badge 
                variant={data.error ? "destructive" : data.result ? "default" : "secondary"}
                className="text-xs sm:text-sm px-2 sm:px-2.5 py-0.5 sm:py-1"
              >
                {data.error ? "Failed" : data.result ? "Completed" : "In Progress"}
              </Badge>
            </div>
          </div>

          {/* Task */}
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-medium text-foreground">Task</h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 sm:h-8 px-2 text-xs sm:text-sm"
                onClick={handleCopyTask}
              >
                {copied ? (
                  <IconCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 text-primary" />
                ) : (
                  <IconClipboard className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 text-muted-foreground" />
                )}
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
            <div className="text-xs sm:text-sm pl-3 sm:pl-4 text-foreground/90">
              {data.task}
            </div>
          </div>

          {/* Error */}
          {data.error && (
            <div className="space-y-2 sm:space-y-3">
              <h3 className="text-base sm:text-lg font-medium text-destructive">Error</h3>
              <Alert variant="destructive">
                <IconAlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <AlertTitle className="text-sm sm:text-base">Task Failed</AlertTitle>
                <AlertDescription className="mt-1.5 sm:mt-2 text-xs sm:text-sm">
                  {data.error}
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Progress */}
          {progress && progress.length > 0 && (
            <div className="space-y-2 sm:space-y-3">
              <h3 className="text-base sm:text-lg font-medium text-foreground">Progress</h3>
              <div className="pl-3 sm:pl-4">
                <AgentSteps progress={progress} />
              </div>
            </div>
          )}

          {/* Result */}
          {data.result && (
            <div className="space-y-2 sm:space-y-3">
              <h3 className="text-base sm:text-lg font-medium text-foreground">Result</h3>
              <div className="pl-3 sm:pl-4">
                <MarkdownResult content={data.result} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
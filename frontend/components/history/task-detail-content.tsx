import { AgentSteps, MarkdownResult } from "@/components/agent-ui";
import { IconAlertTriangle, IconClipboard, IconCheck, IconClock } from '@tabler/icons-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from 'date-fns';
import { useHistoryDetail } from '@/hooks/useHistory';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

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
      <div className="flex flex-col items-center justify-center h-full p-6 bg-muted/5">
        <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mb-4">
          <IconClock className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-sm sm:text-base text-center">
          Select a task to view details
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
        {/* Skeleton Header */}
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-7 w-40 sm:h-8 sm:w-48" />
              <Skeleton className="h-4 w-28 sm:w-32" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>

        {/* Skeleton Task */}
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-16 sm:h-6 sm:w-20" />
            <Skeleton className="h-7 w-16 rounded-md" />
          </div>
          <div className="space-y-2 pl-3 sm:pl-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[85%]" />
            <Skeleton className="h-4 w-[90%]" />
          </div>
        </div>

        {/* Skeleton Progress */}
        <div className="space-y-2 sm:space-y-3">
          <Skeleton className="h-5 w-24 sm:h-6 sm:w-28" />
          <div className="pl-3 sm:pl-4 space-y-4">
            <div className="flex items-start gap-2">
              <Skeleton className="h-4 w-4 rounded-full shrink-0 mt-1" />
              <div className="space-y-1 w-full">
                <Skeleton className="h-4 w-[70%]" />
                <Skeleton className="h-3 w-[40%]" />
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Skeleton className="h-4 w-4 rounded-full shrink-0 mt-1" />
              <div className="space-y-1 w-full">
                <Skeleton className="h-4 w-[80%]" />
                <Skeleton className="h-3 w-[50%]" />
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Skeleton className="h-4 w-4 rounded-full shrink-0 mt-1" />
              <div className="space-y-1 w-full">
                <Skeleton className="h-4 w-[65%]" />
                <Skeleton className="h-3 w-[45%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Skeleton Result */}
        <div className="space-y-2 sm:space-y-3">
          <Skeleton className="h-5 w-20 sm:h-6 sm:w-24" />
          <div className="pl-3 sm:pl-4 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[92%]" />
            <Skeleton className="h-4 w-[88%]" />
            <Skeleton className="h-4 w-[75%]" />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <Card className="max-w-md w-full">
          <CardHeader className="pb-2">
            <h2 className="text-base sm:text-lg font-semibold text-destructive">Error Loading Details</h2>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <IconAlertTriangle className="h-4 w-4" />
              <AlertTitle className="text-sm sm:text-base">Task Details Unavailable</AlertTitle>
              <AlertDescription className="mt-1.5 sm:mt-2 text-xs sm:text-sm">
                {error instanceof Error ? error.message : 'An error occurred while retrieving task details'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
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
        <Card className="rounded-none border-0 shadow-none h-full">
          <CardContent className="p-0">
            <div className="space-y-6 sm:space-y-8 p-4 sm:p-6">
              {/* Header */}
              <div className="space-y-3 sm:space-y-4 border-b pb-4">
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
                <div className="text-xs sm:text-sm pl-3 sm:pl-4 text-foreground/90 bg-muted/10 p-3 rounded-md">
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
                  <div className="pl-3 sm:pl-4 bg-muted/5 rounded-md p-3">
                    <AgentSteps progress={progress} />
                  </div>
                </div>
              )}

              {/* Result */}
              {data.result && (
                <div className="space-y-2 sm:space-y-3">
                  <h3 className="text-base sm:text-lg font-medium text-foreground">Result</h3>
                  <div className="pl-3 sm:pl-4 bg-muted/5 rounded-md p-3">
                    <MarkdownResult content={data.result} />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
import { Button } from "@/components/ui/button";
import { LoadingAnimation, AgentSteps, MarkdownResult } from "@/components/agent-ui";
import { IconX, IconAlertTriangle } from '@tabler/icons-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useHistoryDetail } from '@/hooks/useHistory';
import Image from 'next/image';

interface HistoryDetailProps {
  historyId: string | null;
  onClose: () => void;
}

export function HistoryDetail({ historyId, onClose }: HistoryDetailProps) {
  const { 
    data,
    isLoading,
    isError,
    error
  } = useHistoryDetail(historyId || '');

  if (!historyId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
        <p>Select a run to view details</p>
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
    <div className="flex flex-col h-[calc(100vh-2rem)]">
      {/* Fixed Header */}
      <div className="flex items-center justify-between py-3 px-1">
        <h2 className="text-lg font-semibold">Run Details</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
        >
          <IconX size={16} />
        </Button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pr-1">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-2">Task</h3>
            <p className="text-sm text-muted-foreground">{data.task}</p>
          </div>

          {data.error && (
            <Alert variant="destructive">
              <IconAlertTriangle className="h-4 w-4" />
              <AlertTitle>Task Failed</AlertTitle>
              <AlertDescription className="mt-2">
                {data.error}
              </AlertDescription>
            </Alert>
          )}

          {progress && progress.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Progress</h3>
              <AgentSteps progress={progress} />
            </div>
          )}

          {data.result && (
            <div>
              <h3 className="text-sm font-medium mb-2">Result</h3>
              <MarkdownResult content={data.result} />
            </div>
          )}

          {data.gif_content ? (
            <div>
              <h3 className="text-sm font-medium mb-2">Recording</h3>
              <div className="rounded-lg overflow-hidden border">
                <Image
                  src={`data:image/gif;base64,${data.gif_content}`}
                  alt="Task Recording"
                  width={800}
                  height={600}
                  className="w-full h-auto"
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
} 
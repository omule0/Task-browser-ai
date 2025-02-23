'use client';

import { useParams } from 'next/navigation';
import { TaskDetailContent } from '@/components/history/task-detail-content';
import { LoadingAnimation } from '@/components/agent-ui';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { IconAlertTriangle } from '@tabler/icons-react';
import Image from 'next/image';
import { useHistoryDetail } from '@/hooks/useHistory';

export default function TaskDetailPage() {
  const params = useParams();
  const taskId = params.id as string;
  const { 
    data,
    isLoading,
    isError,
    error
  } = useHistoryDetail(taskId);

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Left Panel - Task Details */}
      <div className="flex-1 border-r overflow-hidden">
        <TaskDetailContent historyId={taskId} />
      </div>

      {/* Right Panel - GIF Recording */}
      <div className="w-[600px] overflow-y-auto bg-muted/5">
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <LoadingAnimation />
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <Alert variant="destructive" className="max-w-md">
                <IconAlertTriangle className="h-4 w-4" />
                <AlertTitle>Error Loading Recording</AlertTitle>
                <AlertDescription>
                  {error instanceof Error ? error.message : 'An error occurred'}
                </AlertDescription>
              </Alert>
            </div>
          ) : data?.gif_content ? (
            <div>
              <h2 className="text-lg font-semibold mb-4">Task Recording</h2>
              <div className="rounded-lg overflow-hidden border bg-white shadow-sm">
                <Image
                  src={`data:image/gif;base64,${data.gif_content}`}
                  alt="Task Recording"
                  width={800}
                  height={900}
                  className="w-full h-full"
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-[400px] text-muted-foreground">
              No recording available
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
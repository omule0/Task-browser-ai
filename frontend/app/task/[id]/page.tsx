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
    <div className="flex flex-col lg:flex-row h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)]">
      {/* Left Panel - Task Details */}
      <div className="flex-1 border-b lg:border-b-0 lg:border-r overflow-hidden">
        <TaskDetailContent historyId={taskId} />
      </div>

      {/* Right Panel - GIF Recording */}
      <div className="h-[40vh] lg:h-auto lg:w-[600px] overflow-y-auto bg-muted/5">
        <div className="p-4 sm:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[200px] sm:min-h-[300px] lg:min-h-[400px]">
              <LoadingAnimation />
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center min-h-[200px] sm:min-h-[300px] lg:min-h-[400px]">
              <Alert variant="destructive" className="max-w-[340px] sm:max-w-md">
                <IconAlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <AlertTitle className="text-sm sm:text-base">Error Loading Recording</AlertTitle>
                <AlertDescription className="text-xs sm:text-sm">
                  {error instanceof Error ? error.message : 'An error occurred'}
                </AlertDescription>
              </Alert>
            </div>
          ) : data?.gif_content ? (
            <div>
              <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Task Recording</h2>
              <div className="rounded-lg overflow-hidden border bg-white shadow-sm">
                <Image
                  src={`data:image/gif;base64,${data.gif_content}`}
                  alt="Task Recording"
                  width={800}
                  height={900}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-[200px] sm:min-h-[300px] lg:min-h-[400px] text-sm sm:text-base text-muted-foreground">
              No recording available
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
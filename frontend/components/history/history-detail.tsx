import { Button } from "@/components/ui/button";
import { AgentSteps, MarkdownResult } from "@/components/agent-ui";
import { IconX, IconAlertTriangle, IconChevronLeft, IconCalendar, IconHistory } from '@tabler/icons-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useHistoryDetail } from '@/hooks/useHistory';
import Image from 'next/image';
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

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

  // If no history item is selected
  if (!historyId) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center max-w-sm"
        >
          <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-primary/10">
            <IconHistory className="w-8 h-8 text-primary" />
          </div>
          <h2 className="mb-2 text-xl font-bold">Select a Task</h2>
          <p className="text-muted-foreground">
            Choose a task from the list to view its details, progress, and results.
          </p>
        </motion.div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        {/* Header skeleton */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-background/90 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>

        {/* Content skeleton */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {/* Task Summary skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-32 w-full rounded-lg" />
            
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
          </div>

          {/* Progress skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-4 w-20" />
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          </div>

          {/* Result skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-40 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-full p-8">
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
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-background/90 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden"
            aria-label="Close details"
          >
            <IconChevronLeft size={18} />
          </Button>
          <h2 className="text-lg font-medium">Task Details</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="hidden lg:flex"
          aria-label="Close details"
        >
          <IconX size={16} />
        </Button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {/* Task Summary */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">TASK</h3>
            <div className="p-4 rounded-lg bg-muted/50 border">
              <p className="text-sm">{data.task}</p>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <IconCalendar size={16} />
                <span>{format(new Date(data.created_at), 'MMM d, yyyy')} at {format(new Date(data.created_at), 'h:mm a')}</span>
              </div>
              <Badge variant={data.result ? "success" : data.error ? "destructive" : "secondary"}>
                {data.result ? "Completed" : data.error ? "Failed" : "Processing"}
              </Badge>
            </div>
          </div>

          {/* Error Message */}
          {data.error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              <Alert variant="destructive">
                <IconAlertTriangle className="h-4 w-4" />
                <AlertTitle>Task Failed</AlertTitle>
                <AlertDescription className="mt-2">
                  {data.error}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Progress Steps */}
          {progress && progress.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.2 }}
              className="space-y-3"
            >
              <h3 className="text-sm font-medium text-muted-foreground">PROGRESS</h3>
              <div className="pl-2">
                <AgentSteps progress={progress} />
              </div>
            </motion.div>
          )}

          {/* Result */}
          {data.result && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.3 }}
              className="space-y-3"
            >
              <h3 className="text-sm font-medium text-muted-foreground">RESULT</h3>
              <div className="p-4 rounded-lg bg-muted/50 border overflow-auto">
                <MarkdownResult content={data.result} />
              </div>
            </motion.div>
          )}

          {/* Recording */}
          {data.gif_content && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.4 }}
              className="space-y-3"
            >
              <h3 className="text-sm font-medium text-muted-foreground">RECORDING</h3>
              <div className="rounded-lg overflow-hidden border">
                <Image
                  src={`data:image/gif;base64,${data.gif_content}`}
                  alt="Task Recording"
                  width={800}
                  height={600}
                  className="w-full h-auto"
                />
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
} 
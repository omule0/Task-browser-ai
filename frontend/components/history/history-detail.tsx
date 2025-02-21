import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { LoadingAnimation, AgentSteps, MarkdownResult } from "@/components/agent-ui";
import { IconX, IconAlertTriangle } from '@tabler/icons-react';
import { createClient } from '@/utils/supabase/client';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';

interface HistoryDetailProps {
  historyId: string | null;
  onClose: () => void;
}

interface HistoryDetailData {
  id: string;
  created_at: string;
  task_name: string;
  task_description: string;
  status: string;
  result: string;
  steps: Array<{
    id: string;
    step_number: number;
    description: string;
    status: string;
    result?: string;
  }>;
  error?: string;
}

export function HistoryDetail({ historyId, onClose }: HistoryDetailProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<HistoryDetailData | null>(null);
  const [error, setError] = useState<string | null>(null);
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
          throw new Error('You must be logged in to view history details');
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
          throw new Error('Failed to fetch history details');
        }

        const historyData = await response.json();
        setData(historyData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        toast({
          variant: "destructive",
          title: "Error",
          description: err instanceof Error ? err.message : 'Failed to fetch history details',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [historyId, supabase.auth, toast]);

  if (!historyId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
        <p>Select a run to view details</p>
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
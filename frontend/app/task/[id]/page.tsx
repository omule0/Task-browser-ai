'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { TaskDetailContent } from '@/components/history/task-detail-content';
import { LoadingAnimation } from '@/components/agent-ui';
import { createClient } from '@/utils/supabase/client';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { IconAlertTriangle } from '@tabler/icons-react';
import Image from 'next/image';

interface HistoryDetailData {
  gif_content?: string;
}

export default function TaskDetailPage() {
  const params = useParams();
  const taskId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gifContent, setGifContent] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchGifContent = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('You must be logged in to view task details');
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/history/${taskId}`,
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

        const data: HistoryDetailData = await response.json();
        setGifContent(data.gif_content || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (taskId) {
      fetchGifContent();
    }
  }, [taskId, supabase.auth]);

  return (
    <div className="flex-1 flex h-screen">
      {/* Left Panel - Task Details */}
      <div className="flex-1 border-r overflow-hidden">
        <TaskDetailContent historyId={taskId} />
      </div>

      {/* Right Panel - GIF Recording */}
      <div className="w-[600px] overflow-y-auto bg-muted/5">
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <LoadingAnimation />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <Alert variant="destructive" className="max-w-md">
                <IconAlertTriangle className="h-4 w-4" />
                <AlertTitle>Error Loading Recording</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          ) : gifContent ? (
            <div>
              <h2 className="text-lg font-semibold mb-4">Task Recording</h2>
              <div className="rounded-lg overflow-hidden border bg-white shadow-sm">
                <Image
                  src={`data:image/gif;base64,${gifContent}`}
                  alt="Task Recording"
                  width={800}
                  height={600}
                  className="w-full h-auto"
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
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { LoadingAnimation, AgentSteps, MarkdownResult } from "@/components/agent-ui";
import { IconX } from '@tabler/icons-react';

interface HistoryDetailProps {
  historyId: string | null;
  onClose: () => void;
}

export function HistoryDetail({ historyId, onClose }: HistoryDetailProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

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
        const response = await fetch(`http://localhost:8000/api/history/${historyId}`);
        if (!response.ok) throw new Error('Failed to fetch history details');
        const data = await response.json();
        setData(data);
      } catch (error) {
        console.error('Error fetching history details:', error);
        setError('Failed to load history details');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [historyId]);

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
      <div className="flex flex-col items-center justify-center min-h-[400px] text-destructive">
        <p>{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const progress = JSON.parse(data.progress);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Run Details</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
        >
          <IconX size={16} />
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-2">Task</h3>
          <p className="text-sm text-muted-foreground">{data.task}</p>
        </div>

        {data.error && (
          <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">
            {data.error}
          </div>
        )}

        <div>
          <h3 className="text-sm font-medium mb-2">Progress</h3>
          <AgentSteps progress={progress} />
        </div>

        {data.result && (
          <div>
            <h3 className="text-sm font-medium mb-2">Result</h3>
            <MarkdownResult content={data.result} />
          </div>
        )}

        {data.gif && (
          <div>
            <h3 className="text-sm font-medium mb-2">Recording</h3>
            <div className="rounded-lg overflow-hidden border">
              <img
                src={`data:image/gif;base64,${data.gif}`}
                alt="Task Recording"
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
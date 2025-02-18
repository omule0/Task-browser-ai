import { LoadingAnimation } from "@/components/agent-ui";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from 'date-fns';
import { IconCheck, IconX, IconAlertTriangle } from '@tabler/icons-react';

interface HistoryItem {
  id: string;
  task: string;
  created_at: string;
  error: string | null;
  result: string | null;
}

interface HistoryListProps {
  history: HistoryItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading: boolean;
}

export function HistoryList({ history, selectedId, onSelect, loading }: HistoryListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingAnimation />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
        <p>No history found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold mb-4">Recent Runs</h2>
      <div className="space-y-2">
        {history.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            className={`w-full justify-start h-auto py-3 ${
              selectedId === item.id ? 'bg-primary/10' : ''
            } ${item.error ? 'hover:bg-destructive/5' : 'hover:bg-primary/5'}`}
            onClick={() => onSelect(item.id)}
          >
            <div className="flex items-start gap-3 w-full">
              <div className="mt-1">
                {item.error ? (
                  <IconAlertTriangle size={16} className="text-destructive" />
                ) : item.result ? (
                  <IconCheck size={16} className="text-primary" />
                ) : (
                  <IconX size={16} className="text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{item.task}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                  </p>
                  {item.error && (
                    <span className="text-xs text-destructive">Failed</span>
                  )}
                </div>
              </div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
} 
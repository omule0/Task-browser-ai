import { LoadingAnimation } from "@/components/agent-ui";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from 'date-fns';
import { IconCheck, IconX, IconAlertTriangle, IconTrash, IconClock } from '@tabler/icons-react';
import { cn } from "@/lib/utils";

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
  onDelete: (id: string) => void;
  loading: boolean;
}

export function HistoryList({ history, selectedId, onSelect, onDelete, loading }: HistoryListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px] sm:min-h-[300px]">
        <LoadingAnimation />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] sm:min-h-[300px] text-muted-foreground">
        <IconClock size={36} className="mb-3 opacity-20" />
        <p className="text-base sm:text-lg font-medium">No History Found</p>
        <p className="text-xs sm:text-sm text-center mt-1 sm:mt-2">Your task history will appear here</p>
      </div>
    );
  }

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDelete(id);
  };

  const getStatusIcon = (item: HistoryItem) => {
    if (item.error) {
      return <IconAlertTriangle size={18} className="text-destructive" />;
    } else if (item.result) {
      return <IconCheck size={18} className="text-primary" />;
    }
    return <IconX size={18} className="text-muted-foreground" />;
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="space-y-2 sm:space-y-3">
        {history.map((item) => (
          <div
            key={item.id}
            className={cn(
              "group relative rounded-xl border transition-all duration-200",
              "hover:shadow-md cursor-pointer",
              selectedId === item.id ? "bg-primary/5 border-primary/20" : "bg-card hover:bg-accent/5",
              item.error && "hover:border-destructive/30"
            )}
          >
            <Button
              variant="ghost"
              className="w-full justify-start h-auto p-3 sm:p-4 space-y-1 sm:space-y-2"
              onClick={() => onSelect(item.id)}
            >
              <div className="flex items-start gap-3 sm:gap-4 w-full">
                <div className={cn(
                  "mt-1 p-1 rounded-full transition-colors",
                  selectedId === item.id ? "bg-primary/10" : "bg-muted"
                )}>
                  {getStatusIcon(item)}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm sm:text-base font-medium leading-tight mb-1 line-clamp-2">
                    {item.task}
                  </p>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                    <span>{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</span>
                    {item.error && (
                      <>
                        <span>•</span>
                        <span className="text-destructive font-medium">Failed</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-200",
                "group-hover:opacity-100",
                "h-7 w-7 sm:h-8 sm:w-8"
              )}
              onClick={(e) => handleDelete(e, item.id)}
              aria-label="Delete task"
            >
              <IconTrash size={16} className="text-muted-foreground hover:text-destructive transition-colors" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
} 
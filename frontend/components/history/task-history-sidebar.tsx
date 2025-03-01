import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { IconSearch, IconCheck, IconX, IconAlertTriangle, IconArrowRight, IconRefresh } from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { Button } from "@/components/ui/button";
import { useFilteredTasks } from '@/hooks/useFilteredTasks';
import { HistoryItem } from '@/hooks/useHistory';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState, useEffect } from 'react';

interface TaskHistorySidebarProps {
  isCollapsed: boolean;
  pollingInterval?: number;
}

// Function to truncate text with ellipsis
const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export function TaskHistorySidebar({ isCollapsed, pollingInterval = 60000 }: TaskHistorySidebarProps) {
  const pathname = usePathname();
  const {
    searchQuery,
    setSearchQuery,
    filteredTasks,
    hasMoreTasks,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useFilteredTasks(pollingInterval);

  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());

  // Update the last refresh time whenever data is refreshed
  useEffect(() => {
    if (!isFetching) {
      setLastRefreshTime(new Date());
    }
  }, [isFetching]);

  const handleManualRefresh = () => {
    refetch();
  };

  if (isError) {
    console.error('Error fetching tasks:', error);
  }

  return (
    <div className="flex flex-col w-full px-1.5 sm:px-2">
      {/* Search Input and Refresh Button */}
      {!isCollapsed && (
        <div className="flex items-center gap-1.5 mb-1.5 sm:mb-2">
          <div className="relative flex-1">
            <IconSearch 
              className="absolute left-2 top-1/2 transform -translate-y-1/2 text-sidebar-foreground/60 w-3.5 h-3.5 sm:w-[18px] sm:h-[18px]" 
            />
            <Input
              type="text"
              placeholder="Search tasks"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-7 sm:pl-8 h-7 sm:h-9 text-xs sm:text-sm bg-sidebar-accent/50 border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/50"
            />
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 sm:h-9 w-7 sm:w-9 flex-shrink-0 relative bg-sidebar-accent/50 border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  onClick={handleManualRefresh}
                  disabled={isFetching}
                  aria-label="Refresh tasks"
                >
                  <IconRefresh 
                    className={cn(
                      "w-3.5 h-3.5 sm:w-[18px] sm:h-[18px]",
                      isFetching && "animate-spin"
                    )} 
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-popover text-popover-foreground">
                <p className="text-xs">
                  {isFetching 
                    ? "Refreshing..." 
                    : `Last refreshed ${formatDistanceToNow(lastRefreshTime, { addSuffix: true })}`
                  }
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      {/* Task History List */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-3 sm:py-4 text-xs sm:text-sm text-sidebar-foreground/70">
              Loading...
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="flex items-center justify-center py-3 sm:py-4 text-xs sm:text-sm text-sidebar-foreground/70">
              {isError ? 'Failed to load tasks' : 'No tasks found'}
            </div>
          ) : (
            <>
              {filteredTasks.map((task: HistoryItem) => (
                <Link
                  key={task.id}
                  href={`/task/${task.id}`}
                  className={cn(
                    "flex items-center gap-2 sm:gap-3 px-2 py-1.5 sm:py-2 rounded-lg transition-colors group",
                    "hover:bg-sidebar-accent",
                    pathname === `/task/${task.id}` 
                      ? "bg-sidebar-primary/10 text-sidebar-primary hover:bg-sidebar-primary/15" 
                      : "text-sidebar-foreground",
                    isCollapsed ? "justify-center" : "justify-start"
                  )}
                  title={task.task}
                >
                  <div className="flex-shrink-0">
                    {task.error ? (
                      <IconAlertTriangle className="w-3.5 h-3.5 sm:w-[18px] sm:h-[18px] text-destructive" />
                    ) : task.result ? (
                      <IconCheck className="w-3.5 h-3.5 sm:w-[18px] sm:h-[18px] text-sidebar-primary" />
                    ) : (
                      <IconX className="w-3.5 h-3.5 sm:w-[18px] sm:h-[18px] text-sidebar-foreground/60" />
                    )}
                  </div>
                  {!isCollapsed && (
                    <div className="flex flex-col min-w-0 max-w-[100px] sm:max-w-[120px]">
                      <span className="text-xs sm:text-sm font-medium truncate leading-tight">
                        {truncateText(task.task, 25)}
                      </span>
                      <span className="text-[10px] sm:text-xs text-sidebar-foreground/60 mt-0.5">
                        {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  )}
                </Link>
              ))}

              {/* Loading indicator during background refresh */}
              {isFetching && !isLoading && (
                <div className="flex items-center justify-center py-1 text-xs text-sidebar-foreground/60">
                  <IconRefresh className="w-3 h-3 animate-spin mr-1" />
                  <span>Updating...</span>
                </div>
              )}
              
              {/* View All Link */}
              {hasMoreTasks && !isCollapsed && (
                <Link href="/history">
                  <Button
                    variant="ghost"
                    className="w-full justify-between items-center text-xs sm:text-sm text-sidebar-foreground/70 hover:text-sidebar-primary mt-1.5 sm:mt-2 h-7 sm:h-8"
                  >
                    View all tasks
                    <IconArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                </Link>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
} 
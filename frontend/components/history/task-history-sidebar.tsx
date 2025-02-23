import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { IconSearch, IconCheck, IconX, IconAlertTriangle, IconArrowRight } from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { Button } from "@/components/ui/button";
import { useFilteredTasks } from '@/hooks/useFilteredTasks';

interface TaskHistorySidebarProps {
  isCollapsed: boolean;
}

// Function to truncate text with ellipsis
const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export function TaskHistorySidebar({ isCollapsed }: TaskHistorySidebarProps) {
  const pathname = usePathname();
  const {
    searchQuery,
    setSearchQuery,
    filteredTasks,
    hasMoreTasks,
    isLoading,
    isError,
    error
  } = useFilteredTasks();

  if (isError) {
    console.error('Error fetching tasks:', error);
  }

  return (
    <div className="flex flex-col w-full px-2">
      {/* Search Input */}
      {!isCollapsed && (
        <div className="relative mb-2">
          <IconSearch 
            size={18} 
            className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="text"
            placeholder="Search tasks"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9 bg-muted/50"
          />
        </div>
      )}

      {/* Task History List */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
              Loading...
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
              {isError ? 'Failed to load tasks' : 'No tasks found'}
            </div>
          ) : (
            <>
              {filteredTasks.map((task) => (
                <Link
                  key={task.id}
                  href={`/task/${task.id}`}
                  className={cn(
                    "flex items-center gap-3 px-2 py-2 rounded-lg transition-colors group",
                    "hover:bg-muted/50",
                    pathname === `/task/${task.id}` && "bg-primary/10 text-primary hover:bg-primary/15",
                    isCollapsed ? "justify-center" : "justify-start"
                  )}
                  title={task.task} // Show full text on hover
                >
                  <div className="flex-shrink-0">
                    {task.error ? (
                      <IconAlertTriangle size={18} className="text-destructive" />
                    ) : task.result ? (
                      <IconCheck size={18} className="text-primary" />
                    ) : (
                      <IconX size={18} className="text-muted-foreground" />
                    )}
                  </div>
                  {!isCollapsed && (
                    <div className="flex flex-col min-w-0 max-w-[120px]">
                      <span className="text-sm font-medium truncate leading-tight">
                        {truncateText(task.task, 25)}
                      </span>
                      <span className="text-xs text-muted-foreground mt-0.5">
                        {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  )}
                </Link>
              ))}
              
              {/* View All Link */}
              {hasMoreTasks && !isCollapsed && (
                <Link href="/history">
                  <Button
                    variant="ghost"
                    className="w-full justify-between items-center text-sm text-muted-foreground hover:text-primary mt-2"
                  >
                    View all tasks
                    <IconArrowRight size={16} />
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
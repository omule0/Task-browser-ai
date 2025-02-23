import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { IconSearch, IconCheck, IconX, IconAlertTriangle, IconArrowRight } from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from 'date-fns';
import { Button } from "@/components/ui/button";

interface TaskHistoryItem {
  id: string;
  task: string;
  created_at: string;
  error: string | null;
  result: string | null;
}

interface TaskHistorySidebarProps {
  isCollapsed: boolean;
}

const MAX_VISIBLE_TASKS = 4;

// Function to truncate text with ellipsis
const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export function TaskHistorySidebar({ isCollapsed }: TaskHistorySidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<TaskHistoryItem[]>([]);
  const pathname = usePathname();
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('You must be logged in to view task history');
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/history`,
          {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch task history');
        }

        const historyData = await response.json();
        setTasks(historyData);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        toast({
          variant: "destructive",
          title: "Error",
          description: err instanceof Error ? err.message : 'Failed to fetch task history',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [supabase.auth, toast]);

  const filteredTasks = tasks
    .filter(task => task.task.toLowerCase().includes(searchQuery.toLowerCase()))
    .slice(0, MAX_VISIBLE_TASKS);

  const hasMoreTasks = tasks.length > MAX_VISIBLE_TASKS;

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
          {loading ? (
            <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
              Loading...
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
              No tasks found
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
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from 'date-fns';
import { IconCheck, IconX, IconAlertTriangle, IconTrash, IconClock, IconFilter, IconSearch } from '@tabler/icons-react';
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { useState } from "react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        {/* Skeleton filters */}
        <div className="space-y-3">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
        
        {/* Skeleton items */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 border-b flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <div className="flex flex-col items-end gap-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-[300px]">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-3">
          <IconClock className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="text-base font-medium mb-1">No History Found</h3>
        <p className="text-sm text-center text-muted-foreground">
          Your task history will appear here
        </p>
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

  const getStatusLabel = (item: HistoryItem) => {
    if (item.error) return "error";
    if (item.result) return "completed";
    return "pending";
  };

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.task.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || getStatusLabel(item) === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="sticky top-0 z-10 p-4 bg-background/80 backdrop-blur-sm border-b">
        <div className="space-y-3">
          <div className="relative">
            <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              className="pl-9 h-9 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 text-sm">
              <div className="flex items-center gap-2">
                <IconFilter size={16} className="text-muted-foreground" />
                <span>
                  {statusFilter === 'all' ? 'All Status' : 
                  statusFilter === 'completed' ? 'Completed' :
                  statusFilter === 'error' ? 'Error' : 'Pending'}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="divide-y divide-border">
        {filteredHistory.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "group relative transition-colors duration-200 cursor-pointer",
              selectedId === item.id ? "bg-muted" : "hover:bg-muted/50"
            )}
            onClick={() => onSelect(item.id)}
          >
            <div className="p-4">
              <div className="flex gap-3">
                <div className={cn(
                  "mt-1 p-1.5 rounded-full flex-shrink-0",
                  selectedId === item.id ? "bg-primary/10" : "bg-muted",
                  item.error && "bg-destructive/10",
                  item.result && "bg-primary/10"
                )}>
                  {getStatusIcon(item)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-medium leading-tight line-clamp-2 text-foreground">
                      {item.task}
                    </h3>
                    <div className="flex-shrink-0 flex flex-col items-end">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                      </span>
                      {item.error && (
                        <span className="text-xs text-destructive mt-1 font-medium">Failed</span>
                      )}
                      {item.result && (
                        <span className="text-xs text-primary mt-1 font-medium">Completed</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 opacity-0 transition-opacity",
                "group-hover:opacity-100",
                "h-7 w-7"
              )}
              onClick={(e) => handleDelete(e, item.id)}
              aria-label="Delete task"
            >
              <IconTrash size={16} className="text-muted-foreground hover:text-destructive transition-colors" />
            </Button>
          </motion.div>
        ))}
      </div>
      
      {filteredHistory.length === 0 && searchQuery && (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <p className="text-sm text-muted-foreground">No tasks matching &quot;{searchQuery}&quot;</p>
        </div>
      )}
    </div>
  );
}
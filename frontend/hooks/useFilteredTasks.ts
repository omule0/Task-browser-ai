import { useState, useMemo } from 'react';
import { useHistory, HistoryItem } from './useHistory';

interface PaginatedResponse {
  data: HistoryItem[];
  total: number;
}

export const MAX_VISIBLE_TASKS = 4;

export function useFilteredTasks() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data, isLoading, isError, error } = useHistory(1, MAX_VISIBLE_TASKS) as {
    data: PaginatedResponse | undefined;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
  };
  const totalTasks = data?.total || 0;

  const filteredTasks = useMemo(() => {
    const tasks = data?.data || [];
    return tasks
      .filter((task: HistoryItem) => task.task.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, MAX_VISIBLE_TASKS);
  }, [data, searchQuery]);

  const hasMoreTasks = totalTasks > MAX_VISIBLE_TASKS;

  return {
    searchQuery,
    setSearchQuery,
    filteredTasks,
    hasMoreTasks,
    isLoading,
    isError,
    error
  };
} 
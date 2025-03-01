import { useState, useMemo } from 'react';
import { useHistory, HistoryItem } from './useHistory';
import { QueryObserverResult, RefetchOptions } from '@tanstack/react-query';

interface PaginatedResponse {
  data: HistoryItem[];
  total: number;
}

export const MAX_VISIBLE_TASKS = 4;

export function useFilteredTasks(pollingInterval = 60000) {
  const [searchQuery, setSearchQuery] = useState('');
  const { 
    data, 
    isLoading, 
    isError, 
    error, 
    refetch,
    isFetching 
  } = useHistory(1, MAX_VISIBLE_TASKS, {
    refetchInterval: pollingInterval,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  }) as {
    data: PaginatedResponse | undefined;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: (options?: RefetchOptions) => Promise<QueryObserverResult<PaginatedResponse, Error>>;
    isFetching: boolean;
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
    error,
    refetch,
    isFetching
  };
} 
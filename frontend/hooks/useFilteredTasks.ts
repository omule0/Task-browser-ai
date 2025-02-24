import { useState, useMemo } from 'react';
import { useHistory, HistoryItem } from './useHistory';

export const MAX_VISIBLE_TASKS = 4;

export function useFilteredTasks() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data, isLoading, isError, error } = useHistory(1, MAX_VISIBLE_TASKS);

  const tasks = data?.data || [];
  const totalTasks = data?.total || 0;

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    
    return tasks
      .filter(task => task.task.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, MAX_VISIBLE_TASKS);
  }, [tasks, searchQuery]);

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
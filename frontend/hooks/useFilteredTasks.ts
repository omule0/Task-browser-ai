import { useState, useMemo } from 'react';
import { useHistory } from './useHistory';

export const MAX_VISIBLE_TASKS = 4;

export function useFilteredTasks() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: tasks = [], isLoading, isError, error } = useHistory();

  const filteredTasks = useMemo(() => {
    const filtered = tasks.filter(task => 
      task.task.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return filtered.slice(0, MAX_VISIBLE_TASKS);
  }, [tasks, searchQuery]);

  const hasMoreTasks = tasks.length > MAX_VISIBLE_TASKS;

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
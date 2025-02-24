import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';

export interface HistoryItem {
  id: string;
  title: string;
  status: string;
  created_at: string;
  task: string;
  error: string | null;
  result: string | null;
  progress: string | ProgressEvent[];
  gif_content?: string;
  task_name?: string;
  task_description?: string;
  steps?: Array<{
    id: string;
    step_number: number;
    description: string;
    status: string;
    result?: string;
  }>;
}

interface ProgressEvent {
  type: string;
  message?: string;
  content?: string;
  success?: boolean;
  title?: string;
  items?: string[];
}

interface PaginatedResponse {
  data: HistoryItem[];
  total: number;
}

const fetchHistory = async (page: number = 1, limit: number = 10): Promise<PaginatedResponse> => {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('You must be logged in to view history');
  }

  const offset = (page - 1) * limit;
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/history?limit=${limit}&offset=${offset}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch history');
  }
  
  return response.json();
};

const fetchHistoryDetail = async (id: string): Promise<HistoryItem> => {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('You must be logged in to view history details');
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/history/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch history detail');
  }
  
  return response.json();
};

export function useHistory(page: number = 1, limit: number = 10) {
  return useQuery<PaginatedResponse>({
    queryKey: ['history', page, limit],
    queryFn: () => fetchHistory(page, limit),
    placeholderData: (previousData) => previousData
  });
}

export function useHistoryDetail(id: string) {
  return useQuery({
    queryKey: ['history', id],
    queryFn: () => fetchHistoryDetail(id),
    enabled: !!id,
  });
}

export function useDeleteHistory() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('You must be logged in to delete history');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/history/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete history item');
      }
      
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] });
    },
  });
} 
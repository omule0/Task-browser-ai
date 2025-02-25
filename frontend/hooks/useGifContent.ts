import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';

/**
 * Custom hook to fetch GIF content for a specific run
 * @param runId The ID of the run to fetch GIF content for
 * @param enabled Whether the query should run automatically
 * @returns React Query result with GIF content data
 */
export function useGifContent(runId: string | null, enabled = true) {
  return useQuery({
    queryKey: ['gifContent', runId],
    queryFn: async () => {
      if (!runId) {
        throw new Error('Run ID is required to fetch GIF content');
      }

      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('You must be logged in to fetch GIF content');
      }

      console.log('[GIF Fetch] Starting fetch for run ID:', runId);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/history/${runId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        console.error('[GIF Fetch] Failed to fetch GIF content:', {
          status: response.status,
          statusText: response.statusText,
          runId
        });
        
        // If we get a 404, it might mean the GIF isn't ready yet
        if (response.status === 404) {
          throw new Error('GIF content is not ready yet');
        }
        
        throw new Error(`Failed to fetch GIF content: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[GIF Fetch] Received history data:', { 
        hasGifContent: !!data.gif_content,
        gifContentLength: data.gif_content ? data.gif_content.length : 0 
      });
      
      if (!data.gif_content) {
        console.warn('[GIF Fetch] No GIF content in response');
      }
      
      return data;
    },
    enabled: !!runId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3, // Increased retries
    retryDelay: (attemptIndex) => Math.min(1000 * (2 ** attemptIndex), 30000), // Exponential backoff with max 30 seconds
  });
} 
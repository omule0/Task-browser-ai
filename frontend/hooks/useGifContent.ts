import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';

interface ChunkedResponse {
  gif_content_chunk?: string;
  chunk_index?: number;
  gif_content_complete?: boolean;
  document_content?: string;
  error?: string;
  [key: string]: unknown;
}

interface GifContentResponse {
  gif_content?: string;
  document_content?: string;
  error?: string;
  [key: string]: unknown;
}

/**
 * Custom hook to fetch GIF content for a specific run
 * @param runId The ID of the run to fetch GIF content for
 * @param enabled Whether the query should run automatically
 * @returns React Query result with GIF content data
 */
export function useGifContent(runId: string | null, enabled = true) {
  return useQuery<GifContentResponse, Error>({
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
      
      // Implement fetch with timeout and retry capability
      const fetchWithTimeout = async (url: string, options: RequestInit, timeout = 30000): Promise<Response> => {
        // Create an abort controller for timeout handling
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
          // Add the signal to options
          const fetchOptions = {
            ...options,
            signal: controller.signal
          };
          
          // Use cache: 'no-store' to prevent caching issues
          if (!fetchOptions.cache) {
            fetchOptions.cache = 'no-store';
          }
          
          const response = await fetch(url, fetchOptions);
          clearTimeout(timeoutId);
          return response;
        } catch (error) {
          clearTimeout(timeoutId);
          console.error('[GIF Fetch] Fetch error:', error);
          
          // Check if it's a timeout or network error
          if (error instanceof Error) {
            if (error.name === 'AbortError') {
              throw new Error('Fetch timeout');
            }
            
            // Add specific handling for StreamReset error
            if (error.message && (
                error.message.includes('StreamReset') || 
                error.message.includes('net::ERR_HTTP2_PROTOCOL_ERROR') ||
                error.message.includes('QUIC_PROTOCOL_ERROR')
              )) {
              throw new Error('Network connection reset. Will retry with different connection.');
            }
          }
          
          throw error;
        }
      };
      
      // Try to fetch data in chunked format for large responses
      const fetchChunkedData = async (): Promise<GifContentResponse> => {
        const response = await fetchWithTimeout(
          `${process.env.NEXT_PUBLIC_API_URL}/api/history/${runId}?format=chunked`, 
          {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Accept': 'application/json'
            }
          }
        );
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('GIF content is not ready yet');
          }
          throw new Error(`Failed to fetch chunked data: ${response.status} ${response.statusText}`);
        }
        
        if (!response.body) {
          throw new Error('Response body is null');
        }
        
        // Process the streaming response
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let result: GifContentResponse = {};
        const gifChunks: string[] = [];
        
        // Buffer for handling incomplete JSON chunks
        let buffer = '';
        
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;
          
          // Process complete lines from the buffer
          const lines = buffer.split('\n');
          // Keep the last potentially incomplete line in the buffer
          buffer = lines.pop() || '';
          
          for (const line of lines.filter(l => l.trim())) {
            try {
              // Attempt to parse JSON
              const data = JSON.parse(line) as ChunkedResponse;
              
              // Handle metadata (first chunk)
              if (!result.gif_content && !data.gif_content_chunk) {
                result = {...data as GifContentResponse};
              }
              
              // Handle GIF content chunks
              if (data.gif_content_chunk && typeof data.chunk_index === 'number') {
                gifChunks[data.chunk_index] = data.gif_content_chunk;
              }
              
              // Handle document content
              if (data.document_content) {
                result.document_content = data.document_content;
              }
              
              // Handle errors
              if (data.error) {
                throw new Error(data.error);
              }
              
              // When complete, combine all chunks
              if (data.gif_content_complete && gifChunks.length > 0) {
                result.gif_content = gifChunks.join('');
                console.log('[GIF Fetch] Received and assembled chunked GIF content:', {
                  totalChunks: gifChunks.length,
                  totalLength: result.gif_content.length
                });
              }
            } catch (parseError) {
              console.error('[GIF Fetch] Error parsing chunk:', parseError, 'Line:', line.substring(0, 100) + (line.length > 100 ? '...' : ''));
              // Continue to next line, don't fail the whole request
              // If the line starts with valid JSON prefix but is corrupted, we may need to wait for more data
            }
          }
        }
        
        // Process any remaining data in buffer
        if (buffer.trim()) {
          try {
            const data = JSON.parse(buffer) as ChunkedResponse;
            
            if (data.gif_content_chunk && typeof data.chunk_index === 'number') {
              gifChunks[data.chunk_index] = data.gif_content_chunk;
            }
            
            if (data.document_content) {
              result.document_content = data.document_content;
            }
            
            if (data.gif_content_complete) {
              result.gif_content = gifChunks.join('');
            }
          } catch (parseError) {
            console.warn('[GIF Fetch] Error parsing final buffer:', parseError);
          }
        }
        
        if (Object.keys(result).length === 0) {
          throw new Error('No data received from chunked response');
        }
        
        // Ensure GIF content is assembled
        if (gifChunks.length > 0 && !result.gif_content) {
          result.gif_content = gifChunks.join('');
        }
        
        return result;
      };
      
      // Try regular fetch
      const fetchRegularData = async (): Promise<GifContentResponse> => {
        const response = await fetchWithTimeout(
          `${process.env.NEXT_PUBLIC_API_URL}/api/history/${runId}`, 
          {
            headers: {
              'Authorization': `Bearer ${session.access_token}`
            }
          }
        );
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('GIF content is not ready yet');
          }
          throw new Error(`Failed to fetch GIF content: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        return data as GifContentResponse;
      };
      
      // Try strategies in order until one succeeds
      const strategies = [
        fetchChunkedData,  // First try chunked for better handling of large content
        fetchRegularData   // Fall back to regular fetch
      ];
      
      // Try each strategy in order
      let lastError: Error | null = null;
      for (const strategy of strategies) {
        try {
          const data = await strategy();
          
          console.log('[GIF Fetch] Received history data:', { 
            hasGifContent: !!data.gif_content,
            gifContentLength: data.gif_content ? data.gif_content.length : 0 
          });
          
          if (!data.gif_content) {
            console.warn('[GIF Fetch] No GIF content in response');
          }
          
          return data;
        } catch (strategyError) {
          console.warn(`[GIF Fetch] Strategy failed:`, strategyError);
          lastError = strategyError instanceof Error ? strategyError : new Error(String(strategyError));
          // Continue to next strategy
        }
      }
      
      // If we get here, all strategies failed
      throw lastError || new Error('All fetch strategies failed');
    },
    enabled: !!runId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 5, // Increased retries
    retryDelay: (attemptIndex) => Math.min(1000 * (2 ** attemptIndex), 30000), // Exponential backoff with max 30 seconds
  });
} 
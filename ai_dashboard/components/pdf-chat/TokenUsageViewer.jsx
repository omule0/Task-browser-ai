"use client";
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Loader2 } from 'lucide-react';

export function TokenUsageViewer({ fileId, refreshTrigger }) {
  const [tokenUsage, setTokenUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTokenUsage = async () => {
      if (!fileId) {
        setTokenUsage(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const supabase = createClient();
        
        const { data, error } = await supabase
          .from('token_usage')
          .select('prompt_tokens, completion_tokens, total_tokens')
          .eq('file_path', fileId);

        if (error) throw error;

        // Calculate totals
        const totals = data.reduce((acc, curr) => ({
          promptTokens: acc.promptTokens + (curr.prompt_tokens || 0),
          completionTokens: acc.completionTokens + (curr.completion_tokens || 0),
          totalTokens: acc.totalTokens + (curr.total_tokens || 0)
        }), {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0
        });

        setTokenUsage(totals);
      } catch (error) {
        console.error('Error fetching token usage:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTokenUsage();
  }, [fileId, refreshTrigger]);

  if (!fileId) return null;

  return (
    <div className="px-3 py-2 border-t border-border bg-secondary/30">
      <h3 className="text-xs font-medium text-muted-foreground mb-2">Token Usage</h3>
      {loading ? (
        <div className="flex items-center justify-center py-1">
          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
        </div>
      ) : tokenUsage ? (
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Prompt:</span>
            <span className="font-medium">{tokenUsage.promptTokens.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Completion:</span>
            <span className="font-medium">{tokenUsage.completionTokens.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs font-medium">
            <span>Total:</span>
            <span>{tokenUsage.totalTokens.toLocaleString()}</span>
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">No usage data available</p>
      )}
    </div>
  );
} 
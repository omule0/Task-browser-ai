import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { fetchTotalTokenUsage } from "@/utils/tokenLimits";

export default function TokenUsage() {
  const [tokenStats, setTokenStats] = useState({
    totalTokensUsed: 0
  });
  
  useEffect(() => {
    async function fetchUsage() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const usage = await fetchTotalTokenUsage(supabase, user.id);
      setTokenStats(usage);
    }

    fetchUsage();
  }, []);

  if (isLoading) {
    return <div className="w-full max-w-md p-4">Loading token usage...</div>;
  }

  const calculatePercentage = (used, total) => Math.round((used / total) * 100);

  return (
    <div className="w-full max-w-md space-y-4 p-4 rounded-lg border bg-card">
      <h3 className="text-lg font-semibold">Token Usage Statistics</h3>
      
      {/* Total Tokens */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Total Tokens</span>
          <span className="text-muted-foreground">
            {tokenStats.totalTokensUsed.toLocaleString()}/{TOKEN_LIMITS.total.toLocaleString()}
          </span>
        </div>
        <Progress 
          value={calculatePercentage(tokenStats.totalTokensUsed, TOKEN_LIMITS.total)}
          className="h-2"
          aria-label="Total tokens progress"
        />
      </div>

      {/* Prompt Tokens */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Prompt Tokens</span>
          <span className="text-muted-foreground">
            {tokenStats.promptTokens.toLocaleString()}/{TOKEN_LIMITS.prompt.toLocaleString()}
          </span>
        </div>
        <Progress 
          value={calculatePercentage(tokenStats.promptTokens, TOKEN_LIMITS.prompt)}
          className="h-2"
          aria-label="Prompt tokens progress"
        />
      </div>

      {/* Completion Tokens */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Completion Tokens</span>
          <span className="text-muted-foreground">
            {tokenStats.completionTokens.toLocaleString()}/{TOKEN_LIMITS.completion.toLocaleString()}
          </span>
        </div>
        <Progress 
          value={calculatePercentage(tokenStats.completionTokens, TOKEN_LIMITS.completion)}
          className="h-2"
          aria-label="Completion tokens progress"
        />
      </div>

      <div className="text-xs text-muted-foreground mt-4">
        Token usage is updated after each document generation
      </div>
    </div>
  );
} 
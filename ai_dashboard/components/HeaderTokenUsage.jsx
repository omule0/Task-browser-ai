import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Progress } from "@/components/ui/progress";
import { Coins } from "lucide-react";

export function HeaderTokenUsage() {
  const [tokenStats, setTokenStats] = useState({
    totalTokens: 0
  });
  
  const TOKEN_LIMIT = 1000000; // 1 million tokens

  useEffect(() => {
    async function fetchTokenUsage() {
      const supabase = createClient();
      
      const { data: reports, error } = await supabase
        .from('generated_reports')
        .select('token_usage');

      if (error) {
        console.error('Error fetching token usage:', error);
        return;
      }

      const totalTokens = reports.reduce((acc, report) => {
        const usage = report.token_usage || { totalTokens: 0 };
        return acc + (usage.totalTokens || 0);
      }, 0);

      setTokenStats({ totalTokens });
    }

    fetchTokenUsage();
  }, []);

  const percentage = Math.round((tokenStats.totalTokens / TOKEN_LIMIT) * 100);

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className="flex items-center gap-2 cursor-pointer">
          <Coins className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {(tokenStats.totalTokens / 1000).toFixed(1)}k
          </span>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-4">
          <h4 className="text-sm font-semibold">Token Usage</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Total Tokens Used</span>
              <span className="text-muted-foreground">
                {tokenStats.totalTokens.toLocaleString()}/{TOKEN_LIMIT.toLocaleString()}
              </span>
            </div>
            <Progress 
              value={percentage}
              className="h-2"
              aria-label="Token usage progress"
            />
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
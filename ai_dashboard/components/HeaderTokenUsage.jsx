import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Progress } from "@/components/ui/progress";
import { Coins } from "lucide-react";
import { fetchTotalTokenUsage } from "@/utils/tokenLimits";

export function HeaderTokenUsage() {
  const [tokenStats, setTokenStats] = useState({
    totalTokensUsed: 0
  });
  const [mounted, setMounted] = useState(false);
  
  const TOKEN_LIMIT = 1000000;

  useEffect(() => {
    setMounted(true);
    async function fetchTokenUsage() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const usage = await fetchTotalTokenUsage(supabase, user.id);
      setTokenStats(usage);
    }

    fetchTokenUsage();
  }, []);

  // Calculate these values only after mounting
  const percentage = mounted ? Math.round((tokenStats.totalTokensUsed / TOKEN_LIMIT) * 100) : 0;
  const isNearLimit = mounted && percentage > 90;
  const isAtLimit = mounted && percentage >= 100;

  // Base styles that will be consistent between server and client
  const progressBaseClass = "h-2";
  const progressStateClass = mounted ? (
    isAtLimit ? 'bg-red-100' : 
    isNearLimit ? 'bg-yellow-100' : ''
  ) : '';

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className="flex items-center gap-2 cursor-pointer">
          <Coins className={`h-5 w-5 ${
            mounted ? (
              isAtLimit ? 'text-red-500' : 
              isNearLimit ? 'text-yellow-500' : 
              'text-muted-foreground'
            ) : 'text-muted-foreground'
          }`} />
          <span className={`text-sm ${
            mounted ? (
              isAtLimit ? 'text-red-500' : 
              isNearLimit ? 'text-yellow-500' : 
              'text-muted-foreground'
            ) : 'text-muted-foreground'
          }`}>
            {mounted ? `${(tokenStats.totalTokensUsed / 1000).toFixed(1)}k` : '0.0k'}
          </span>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-4">
          <h4 className="text-sm font-semibold">Token Usage</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Total Tokens Used</span>
              <span className={mounted && isAtLimit ? 'text-red-500' : 'text-muted-foreground'}>
                {mounted ? (
                  `${tokenStats.totalTokensUsed.toLocaleString()}/${TOKEN_LIMIT.toLocaleString()}`
                ) : '0/1,000,000'}
              </span>
            </div>
            <Progress 
              value={percentage}
              className={`${progressBaseClass} ${progressStateClass}`}
              aria-label="Token usage progress"
            />
            {mounted && isAtLimit && (
              <p className="text-sm text-red-500 mt-2">
                Token limit reached. Contact support to increase your limit.
              </p>
            )}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
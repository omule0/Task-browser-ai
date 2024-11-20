export function isTokenLimitExceeded(tokenUsage, TOKEN_LIMIT = 10000) {
  return tokenUsage.totalTokensUsed >= TOKEN_LIMIT;
}

export function isApproachingTokenLimit(tokenUsage, TOKEN_LIMIT = 10000) {
  const ESTIMATED_TOKENS_PER_GENERATION = 5000;
  const remainingTokens = TOKEN_LIMIT - tokenUsage.totalTokensUsed;
  return remainingTokens < ESTIMATED_TOKENS_PER_GENERATION;
}

export async function fetchTotalTokenUsage(supabase, userId) {
  const { data: usageLogs, error } = await supabase
    .from('token_usage_logs')
    .select('tokens_used')
    .eq('user_id', userId)
    .gte('created_at', new Date(new Date().setDate(new Date().getDate() - 30)).toISOString());

  if (error) {
    console.error('Error fetching token usage:', error);
    return { totalTokensUsed: 0 };
  }

  const totalTokensUsed = usageLogs.reduce((acc, log) => acc + (log.tokens_used || 0), 0);
  
  return { totalTokensUsed };
} 
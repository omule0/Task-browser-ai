export function isTokenLimitExceeded(tokenStats, TOKEN_LIMIT = 1000000) {
  return tokenStats.totalTokens >= TOKEN_LIMIT;
}

export function isApproachingTokenLimit(tokenStats, TOKEN_LIMIT = 1000000) {
  // Check if remaining tokens are less than estimated usage (let's say 50k tokens per generation)
  const ESTIMATED_TOKENS_PER_GENERATION = 50000;
  const remainingTokens = TOKEN_LIMIT - tokenStats.totalTokens;
  return remainingTokens < ESTIMATED_TOKENS_PER_GENERATION;
} 
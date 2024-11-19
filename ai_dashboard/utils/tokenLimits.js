export function isTokenLimitExceeded(tokenStats, TOKEN_LIMIT = 1000000) {
  return tokenStats.totalTokens >= TOKEN_LIMIT;
} 
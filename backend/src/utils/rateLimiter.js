// Basic rate limiting with delay tracking and retry logic
// Tracks last request timestamp per connector and implements exponential backoff

const lastRequestTime = new Map(); // connectorId -> timestamp

export const delayRequest = async (connectorId, rateLimitConfig) => {
  const now = Date.now();
  const lastTime = lastRequestTime.get(connectorId) || 0;

  // Calculate delay based on rate limit config
  let delayMs = 0;
  
  if (rateLimitConfig?.requestsPerSecond) {
    const minInterval = 1000 / rateLimitConfig.requestsPerSecond;
    const timeSinceLastRequest = now - lastTime;
    if (timeSinceLastRequest < minInterval) {
      delayMs = minInterval - timeSinceLastRequest;
    }
  } else if (rateLimitConfig?.requestsPerMinute) {
    const minInterval = (60 * 1000) / rateLimitConfig.requestsPerMinute;
    const timeSinceLastRequest = now - lastTime;
    if (timeSinceLastRequest < minInterval) {
      delayMs = minInterval - timeSinceLastRequest;
    }
  }

  if (delayMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  lastRequestTime.set(connectorId, Date.now());
};

export const retryWithBackoff = async (fn, maxRetries = 3, initialDelay = 1000) => {
  let delay = initialDelay;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      // Check if it's a rate limit error (429)
      if (error.response?.status === 429 && attempt < maxRetries) {
        console.log(`Rate limited, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff: 1s, 2s, 4s, etc.
        continue;
      }
      
      // For other errors or final attempt, throw
      throw error;
    }
  }
};

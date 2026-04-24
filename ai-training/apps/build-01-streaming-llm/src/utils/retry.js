// src/utils/retry.js
 
// WHY: LLM APIs return 429 (rate limit) and 503 (overloaded).
// Exponential backoff means: wait 1s, then 2s, then 4s before giving up.
// This handles temporary outages without hammering the API.
export async function withRetry(fn, maxRetries = 3) {
  let lastError
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      const retryable = err.status === 429 || err.status === 503 || err.status === 408
      if (!retryable || attempt === maxRetries) throw err
      const delay = Math.pow(2, attempt - 1) * 1000   // 1s, 2s, 4s
      await new Promise(r => setTimeout(r, delay))
    }
  }
  throw lastError
}
 
// WHY: Fallback chain tries primary provider first,
// then secondary if primary fails after retries.
export async function* withFallback(providers, request, log) {
  const errors = []
  for (const provider of providers) {
    try {
      log.info({ provider: provider.name }, 'Attempting LLM request')
      yield* provider.streamChat(request)
      return  
    } catch (err) {
      // Log the full error for terminal visibility
      log.error({ 
        provider: provider.name, 
        message: err.message,
        status: err.status,
        stack: err.stack,
        raw: err.error // Some SDKs put more detail here
      }, 'Provider failed')
      
      errors.push(`${provider.name}: ${err.message}`)
    }
  }
  throw new Error(`All providers failed: ${errors.join(' | ')}`)
}

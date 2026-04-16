// src/memory/conversation.js
 
// WHY Redis and not a Map:
// - Map dies on server restart. Redis survives.
// - 2 Node processes (horizontal scale) share one Redis.
// - TTL auto-expires old sessions. Maps leak memory.
 
export function createConversationStore(redis) {
  const PREFIX = 'session:'
  const TTL = 86400  // 24 hours in seconds
 
  return {
    async get(sessionId) {
      if (!redis) return []
      const raw = await redis.get(PREFIX + sessionId)
      return raw ? JSON.parse(raw) : []
    },
 
    async append(sessionId, message) {
      if (!redis) return []
      const history = await this.get(sessionId)
      history.push({ ...message, timestamp: Date.now() })
      // setex is atomic: SET + EXPIRE in one command
      await redis.setex(PREFIX + sessionId, TTL, JSON.stringify(history))
      return history
    },
 
    async clear(sessionId) {
      if (redis) await redis.del(PREFIX + sessionId)
    },
 
    // WHY truncate: context window has a token limit.
    // At 80% capacity, remove oldest messages (keep system + last 4 messages).
    truncate(messages, maxTokensEstimate = 4000) {
      // Rough estimate: 1 token ≈ 4 chars
      const totalChars = messages.reduce((s, m) => s + m.content.length, 0)
      if (totalChars / 4 < maxTokensEstimate * 0.8) return messages
 
      // Keep last 4 messages (2 exchanges)
      const systemMsgs = messages.filter(m => m.role === 'system')
      const nonSystem  = messages.filter(m => m.role !== 'system')
      return [...systemMsgs, ...nonSystem.slice(-4)]
    }
  }
}

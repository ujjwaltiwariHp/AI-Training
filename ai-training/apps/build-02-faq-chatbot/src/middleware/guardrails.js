import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const PII_PATTERNS = {
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  phone: /(\+?\d[\s\-.]?){9,13}\d/g,
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  card: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g
}

const INJECTION_PATTERNS = [
  'ignore previous', 'ignore all', 'you are now', 'forget your',
  'system prompt', 'reveal your instructions', 'act as'
]

export async function runGuardrails(message, sessionId, redis) {
  // 1. Length check
  if (message.length > 5000) {
    throw { statusCode: 400, message: 'Message too long (max 5000 chars)' }
  }

  // 2. Rate limit: 10 req/min per session
  const key = `rate:${sessionId}`
  const count = await redis.incr(key)
  if (count === 1) await redis.expire(key, 60)
  if (count > 10) {
    throw { statusCode: 429, message: 'Rate limit exceeded. Please wait a moment.' }
  }

  // 3. PII Detection
  let sanitized = message
  for (const [type, pattern] of Object.entries(PII_PATTERNS)) {
    sanitized = sanitized.replace(pattern, `[${type.toUpperCase()}_REDACTED]`)
  }

  // 4. Content Moderation (Skipped: requires OpenAI key)
  // const mod = await openai.moderations.create({ input: sanitized })
  // if (mod.results[0].flagged) {
  //   throw { statusCode: 400, message: 'Message flagged by content moderation.' }
  // }

  // 5. Injection scan
  const lowerMsg = sanitized.toLowerCase()
  for (const pattern of INJECTION_PATTERNS) {
    if (lowerMsg.includes(pattern)) {
      throw { statusCode: 400, message: 'Invalid message format.' }
    }
  }

  return sanitized
}

export async function validateOutput(response) {
  // Check for system prompt leak
  const suspiciousPatterns = ['system prompt', 'your instructions', 'as an AI language']
  const lower = response.toLowerCase()
  for (const p of suspiciousPatterns) {
    if (lower.includes(p)) {
      return 'I\'m sorry, I cannot provide that information.'
    }
  }
  return response
}

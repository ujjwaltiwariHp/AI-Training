// src/routes/chat.js
import { z } from 'zod'
import { withFallback } from '../utils/retry.js'
import { createConversationStore } from '../memory/conversation.js'
 
const ChatSchema = z.object({
  sessionId: z.string().min(1).max(100),
  message:   z.string().min(1).max(5000),
  provider:  z.enum(['openai', 'anthropic', 'gemini']).optional(),
  systemPrompt: z.string().optional()
})
 
export async function chatRoutes(fastify, opts) {
  const store = createConversationStore(fastify.redis)
  const { providers } = opts   // injected from server.js
 
  fastify.post('/api/chat', async (req, reply) => {
    // 1. Validate input with Zod
    const body = ChatSchema.safeParse(req.body)
    if (!body.success) {
      return reply.code(400).send({ error: body.error.flatten() })
    }
    const { sessionId, message, provider, systemPrompt } = body.data
 
    // 2. Load conversation history from Redis
    let history = await store.get(sessionId)
    history = store.truncate(history)
 
    // 3. Add new user message
    const userMsg = { role: 'user', content: message }
    history.push(userMsg)
 
    // 4. Pick provider order for fallback chain
    // Default order: Gemini -> OpenAI -> Anthropic (as Gemini is the new primary requested)
    let providerOrder = [providers.gemini, providers.openai, providers.anthropic]
    
    if (provider === 'openai') {
      providerOrder = [providers.openai, providers.gemini, providers.anthropic]
    } else if (provider === 'anthropic') {
      providerOrder = [providers.anthropic, providers.gemini, providers.openai]
    } else if (provider === 'gemini') {
      providerOrder = [providers.gemini, providers.openai, providers.anthropic]
    }
 
    // 5. Set up SSE response headers
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Correlation-Id': req.correlationId
    })
 
    // 6. Abort management per-request
    const abortController = new AbortController()
    let aborted = false
    
    req.raw.on('close', () => {
      aborted = true
      abortController.abort()
      req.log.warn({ correlationId: req.correlationId },
        'Client disconnected mid-stream — aborting LLM call')
    })
 
    // 7. Stalled stream detection
    let stallTimer
    const resetStall = () => {
      clearTimeout(stallTimer)
      stallTimer = setTimeout(() => {
        req.log.warn({ correlationId: req.correlationId }, 'Stream stalled — closing')
        if (!aborted) {
          reply.raw.write(`data: ${JSON.stringify({ type: 'error', message: 'Stream stalled' })}\n\n`)
          reply.raw.end()
        }
      }, 30_000)
    }
    resetStall()
 
    let assistantContent = ''
 
    try {
      for await (const chunk of withFallback(providerOrder, {
        messages: history,
        systemPrompt,
        correlationId: req.correlationId,
        signal: abortController.signal
      }, req.log)) {
        if (aborted) break
 
        if (chunk.type === 'token') {
          assistantContent += chunk.content
          resetStall()
          reply.raw.write(`data: ${JSON.stringify(chunk)}\n\n`)
        }
 
        if (chunk.type === 'done') {
          req.log.info({
            correlationId: req.correlationId,
            sessionId,
            ...chunk.usage
          }, 'LLM request complete')
          reply.raw.write(`data: ${JSON.stringify(chunk)}\n\n`)
        }
      }
    } catch (err) {
      req.log.error({ err: err.message, correlationId: req.correlationId }, 'Streaming error')
      if (!aborted) {
        // Send error as SSE event instead of crashing
        reply.raw.write(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`)
      }
    } finally {
      clearTimeout(stallTimer)
      if (!aborted) {
        // 8. Save assistant reply to Redis if successful
        if (assistantContent) {
          await store.append(sessionId, { role: 'user', content: message })
          await store.append(sessionId, { role: 'assistant', content: assistantContent })
        }
        reply.raw.end()
      }
    }
  })
 
  fastify.get('/api/chat/:sessionId/history', async (req) => {
    return store.get(req.params.sessionId)
  })
 
  fastify.delete('/api/chat/:sessionId', async (req, reply) => {
    await store.clear(req.params.sessionId)
    return reply.code(204).send()
  })
}

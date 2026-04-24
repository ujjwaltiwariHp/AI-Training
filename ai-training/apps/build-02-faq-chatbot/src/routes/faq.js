import Anthropic from '@anthropic-ai/sdk'
import { loadPrompt } from '../services/prompt-loader.js'
import { runGuardrails, validateOutput } from '../middleware/guardrails.js'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function faqRoutes(fastify) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  
  // Lazily load or read faqData
  let faqData = null;
  async function getFaqData() {
    if (!faqData) {
      faqData = JSON.parse(await readFile(join(process.cwd(), 'src/data/faq.json'), 'utf-8'))
    }
    return faqData
  }

  fastify.post('/api/faq/chat', async (req, reply) => {
    const { message, sessionId, model } = req.body

    if (!message || !sessionId) {
      return reply.code(400).send({ error: 'message and sessionId are required' })
    }

    // Guardrails
    let sanitizedMessage
    try {
      sanitizedMessage = await runGuardrails(message, sessionId, fastify.redis)
    } catch (err) {
      return reply.code(err.statusCode || 400).send({ error: err.message })
    }

    // Cost cap
    const costKey = `cost:${sessionId}`
    const sessionCost = parseFloat(await fastify.redis.get(costKey) || '0')
    if (sessionCost >= 0.50) {
      return reply.code(429).send({ error: 'Session limit reached. Please start a new session.' })
    }

    const data = await getFaqData()
    const faqContent = data.faqs
      .map(f => `Q: ${f.question}\nA: ${f.answer}`)
      .join('\n\n')

    const systemPrompt = await loadPrompt('faq-system', {
      company_name: data.company,
      faq_content: faqContent
    })

    const historyKey = `history:${sessionId}`
    const rawHistory = await fastify.redis.get(historyKey)
    const history = rawHistory ? JSON.parse(rawHistory) : []
    history.push({ role: 'user', content: sanitizedMessage })

    reply.raw.setHeader('Content-Type', 'text/event-stream')
    reply.raw.setHeader('Cache-Control', 'no-cache')
    reply.raw.setHeader('Connection', 'keep-alive')

    let fullResponse = ''
    let inputTokens = 0
    let outputTokens = 0

    try {
        const stream = await anthropic.messages.stream({
            model: model || 'claude-haiku-4-5',
            max_tokens: 1000,
            system: systemPrompt,
            messages: history
        })

        for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
                const token = chunk.delta.text
                fullResponse += token
                reply.raw.write(`data: ${JSON.stringify({ type: 'token', content: token })}\n\n`)
            }
        }

        const finalMsg = await stream.finalMessage()
        inputTokens = finalMsg.usage.input_tokens
        outputTokens = finalMsg.usage.output_tokens

        fullResponse = await validateOutput(fullResponse)

        // Track cost
        const cost = (inputTokens * 0.0000008) + (outputTokens * 0.000004)
        const newCost = sessionCost + cost
        await fastify.redis.set(costKey, newCost.toString(), 'EX', 86400)

        history.push({ role: 'assistant', content: fullResponse })
        await fastify.redis.set(historyKey, JSON.stringify(history), 'EX', 86400)

        if (fullResponse.toLowerCase().includes("don't have information")) {
            await fastify.redis.lpush('unanswered', sanitizedMessage)
        }

        reply.raw.write(`data: ${JSON.stringify({ type: 'done', usage: { inputTokens, outputTokens, cost } })}\n\n`)
        reply.raw.end()
    } catch(err) {
        req.log.error({ 
            message: err.message, 
            status: err.status, 
            raw: err.error,
            stack: err.stack 
        }, 'FAQ generation failed')
        
        reply.raw.write(`data: ${JSON.stringify({ type: 'error', error: `FAQ Error: ${err.message}` })}\n\n`)
        reply.raw.end()
    }
  })

  fastify.get('/api/faq/analytics', async (req, reply) => {
    const unanswered = await fastify.redis.lrange('unanswered', 0, -1)
    
    const keys = await fastify.redis.keys('feedback:*')
    let ratings = { helpful: 0, notHelpful: 0 }
    
    for (const key of keys) {
        const item = await fastify.redis.get(key)
        if (item) {
            const parsed = JSON.parse(item)
            if (parsed.rating === 'helpful') ratings.helpful++
            else if (parsed.rating === 'not-helpful') ratings.notHelpful++
        }
    }
    
    return { unansweredQuestions: unanswered, ratings }
  })

  fastify.get('/api/faq/topics', async (req, reply) => {
      const data = await getFaqData()
      return { categories: data.categories }
  })

  fastify.post('/api/faq/feedback', async (req, reply) => {
      const { question, answer, rating } = req.body
      if(!question || !answer || !rating) return reply.code(400).send({error: 'Invalid request body'})
      
      const key = `feedback:${Date.now()}`
      await fastify.redis.set(key, JSON.stringify({ question, answer, rating }), 'EX', 2592000)
      return { message: 'Feedback recorded' }
  })
}

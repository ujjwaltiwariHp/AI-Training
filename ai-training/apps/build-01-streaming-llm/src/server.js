// src/server.js
import Fastify from 'fastify'
import helmet from '@fastify/helmet'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import { loggerConfig } from './plugins/logger.js'
import { config } from './config.js'
import correlationIdPlugin from './middleware/correlation-id.js'
import redisPlugin from './plugins/redis.js'
import { healthRoutes } from './routes/health.js'
import { chatRoutes } from './routes/chat.js'
import { OpenAIProvider } from './providers/openai.js'
import { AnthropicProvider } from './providers/anthropic.js'
import { GeminiProvider } from './providers/gemini.js'
 
const fastify = Fastify({ logger: loggerConfig, trustProxy: true })
 
// Initialise providers once
const providers = {
  anthropic: new AnthropicProvider(config.anthropicKey)
}
 
async function start() {
  await fastify.register(helmet)
  await fastify.register(cors, { origin: config.corsOrigins })
  await fastify.register(rateLimit, { max: 100, timeWindow: '1 minute' })
  await fastify.register(correlationIdPlugin)
  await fastify.register(redisPlugin)
  await fastify.register(healthRoutes)
  await fastify.register(chatRoutes, { providers })
 
  fastify.setErrorHandler((error, req, reply) => {
    req.log.error({ err: error, correlationId: req.correlationId }, 'Request error')
    reply.code(error.statusCode || 500).send({
      error: error.message, correlationId: req.correlationId
    })
  })
 
  const address = await fastify.listen({ port: config.port, host: '0.0.0.0' })
  fastify.log.info({ address }, 'Build 1 server started')
}
 
const shutdown = async (signal) => {
  fastify.log.info({ signal }, 'Shutdown signal received')
  await fastify.close()
  process.exit(0)
}
 
process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT',  () => shutdown('SIGINT'))
 
start().catch(err => { 
  console.error(err); 
  process.exit(1) 
})

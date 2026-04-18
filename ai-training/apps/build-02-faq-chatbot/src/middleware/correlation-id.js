import { randomUUID } from 'crypto'
import fp from 'fastify-plugin'

async function correlationIdPlugin(fastify) {
  fastify.addHook('onRequest', async (req) => {
    req.correlationId = req.headers['x-correlation-id'] || randomUUID()
    req.log = req.log.child({ correlationId: req.correlationId })
  })

  fastify.addHook('onSend', async (req, reply) => {
    reply.header('x-correlation-id', req.correlationId)
  })
}

export default fp(correlationIdPlugin, { name: 'correlation-id' })

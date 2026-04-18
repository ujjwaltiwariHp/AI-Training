import fp from 'fastify-plugin'
import Redis from 'ioredis'
import { config } from '../config.js'

async function redisPlugin(fastify) {
  const redis = new Redis(config.redisUrl, {
    lazyConnect: false,
    retryStrategy(times) {
      if (times > 10) {
        fastify.log.error('Redis: max retries exceeded, giving up')
        return null
      }
      const delay = Math.min(times * 200, 3000)
      fastify.log.warn({ times, delay }, 'Redis: retrying connection')
      return delay
    },
  })

  redis.on('connect', () => fastify.log.info('Redis: connected'))
  redis.on('error', (err) => fastify.log.error({ err }, 'Redis: error'))

  fastify.decorate('redis', redis)

  fastify.addHook('onClose', async () => {
    fastify.log.info('Redis: closing connection')
    await redis.quit()
  })
}

export default fp(redisPlugin, { name: 'redis' })

export async function healthRoutes(fastify) {
  fastify.get('/health', {
    config: { skipAuth: true },
  }, async (req, reply) => {
    const start = Date.now()

    const redisStatus = await checkRedis(fastify.redis)

    const status = redisStatus.ok ? 'healthy' : 'degraded'

    return reply.code(status === 'healthy' ? 200 : 503).send({
      status,
      uptime: Math.floor(process.uptime()),
      dependencies: {
        redis: redisStatus,
      },
      version: process.env.npm_package_version || '0.0.1',
    })
  })
}

async function checkRedis(redis) {
  const start = Date.now()
  try {
    await redis.ping()
    return { status: 'connected', latency: `${Date.now() - start}ms`, ok: true }
  } catch (err) {
    return { status: 'disconnected', error: err.message, ok: false }
  }
}

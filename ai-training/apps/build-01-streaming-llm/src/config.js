import 'dotenv/config'

function requireEnv(name) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required env var: ${name}`)
  }
  return value
}

export const config = {
  port: parseInt(process.env.PORT || '3000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'debug',

  redisUrl: requireEnv('REDIS_URL'),
  jwtSecret: requireEnv('JWT_SECRET'),

  anthropicKey: process.env.ANTHROPIC_API_KEY || '',
  awsBearerTokenBedrock: process.env.AWS_BEARER_TOKEN_BEDROCK || '',

  corsOrigins: process.env.CORS_ORIGINS === '*' ? '*' : (process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3004']),
}

import { config } from '../config.js'

export const loggerConfig = {
    level: config.logLevel,

    redact: {
        paths: [
            'req.headers.authorization',
            'req.body.password',
            'req.body.apiKey',
            'req.body.secret',
        ],
        censor: '[REDACTED]',
    },

    transport: config.nodeEnv === 'development'
        ? {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'HH:MM:ss',
                ignore: 'pid,hostname',
            },
        }
        : undefined,

    serializers: {
        req(req) {
            return {
                method: req.method,
                url: req.url,
                correlationId: req.correlationId,
            }
        },
    },
}

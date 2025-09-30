import { makeLoggerProvider } from '@niki/logger'
import { type FastifyInstance, type FastifyReply, type FastifyRequest } from 'fastify'

declare module 'fastify' {
  interface FastifyRequest {
    requestId: string
    startTime: number
  }
}

export function loggerMiddleware(fastify: FastifyInstance): void {
  const logger = makeLoggerProvider()

  fastify.addHook('onRequest', (request: FastifyRequest) => {
    const requestIdHeader = request.headers['x-request-id']
    const requestId = (Array.isArray(requestIdHeader) ? requestIdHeader[0] : requestIdHeader) ?? crypto.randomUUID()
    request.requestId = requestId
    request.startTime = Date.now()

    logger.sendLogInfo({
      message: 'Request started',
      data: {
        requestId,
        method: request.method,
        url: request.url,
        userAgent: request.headers['user-agent'],
        ip: request.ip,
        hostname: request.hostname
      }
    })
  })

  fastify.addHook('onResponse', (request: FastifyRequest, reply: FastifyReply) => {
    const responseTime = Date.now() - request.startTime

    logger.sendLogInfo({
      message: 'Request completed',
      data: {
        requestId: request.requestId,
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        responseTime: `${responseTime}ms`,
        contentLength: reply.getHeader('content-length') ?? 0
      }
    })
  })

  fastify.addHook('onError', (request: FastifyRequest, _reply: FastifyReply, error: Error) => {
    logger.sendLogError({
      message: 'Request error',
      value: {
        requestId: request.requestId,
        method: request.method,
        url: request.url,
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      }
    })
  })
}

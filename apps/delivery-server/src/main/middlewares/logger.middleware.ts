import { makeLoggerProvider } from '@niki/logger'
import { type MiddlewareHandler } from 'hono'

export const loggerMiddleware: MiddlewareHandler = async (c, next) => {
  const logger = makeLoggerProvider()
  const start = Date.now()
  const requestID = c.req.header('x-request-id') ?? crypto.randomUUID()
  c.set('requestID', requestID)
  c.set('logger', logger)
  logger.sendLogInfo({
    message: 'Request started',
    data: {
      requestID,
      method: c.req.method,
      url: c.req.url,
      userAgent: c.req.header('User-Agent')
    }
  })
  await next()
  const responseTime = Date.now() - start
  logger.sendLogInfo({
    message: 'Request completed',
    data: {
      requestID,
      method: c.req.method,
      url: c.req.url,
      status: c.res.status,
      responseTime: `${responseTime}ms`
    }
  })
}

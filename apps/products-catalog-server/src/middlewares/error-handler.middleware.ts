import { makeLoggerProvider } from '@niki/logger'
import { type ErrorHandler } from 'hono'
import { HTTPException } from 'hono/http-exception'

export const errorHandler: ErrorHandler = (error: unknown, c) => {
  const logger = makeLoggerProvider()
  const requestID = c.get('requestID') ?? 'unknown'

  if (error instanceof HTTPException) {
    logger.sendLogWarn({
      message: 'HTTP Exception occurred',
      data: {
        requestID,
        status: error.status,
        message: error.message,
        url: c.req.url,
        method: c.req.method
      }
    })

    return c.json(
      {
        success: null,
        error: {
          name: 'HTTPException',
          message: error.message,
          requestID
        }
      },
      error.status
    )
  }

  logger.sendLogError({
    message: 'Unhandled error occurred',
    value: {
      error: error,
      requestID,
      url: c.req.url,
      method: c.req.method
    }
  })

  return c.json(
    {
      success: null,
      error: {
        name: 'InternalServerError',
        message: 'An internal server error occurred',
        requestID
      }
    },
    500
  )
}

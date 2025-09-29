import { serve } from '@hono/node-server'
import { OpenAPIHono } from '@hono/zod-openapi'
import { corsMiddleware } from '@middlewares/cors.middleware'
import { errorHandler } from '@middlewares/error-handler.middleware'
import { loggerMiddleware } from '@middlewares/logger.middleware'
import { notFoundHandler } from '@middlewares/not-found.middleware'
import { HTTP_STATUS_CODE } from '@niki/utils'
import { compress } from 'hono/compress'
import { prettyJSON } from 'hono/pretty-json'
import { secureHeaders } from 'hono/secure-headers'

import { routes } from './routes/_routes'

export function buildApp(): OpenAPIHono {
  const app = new OpenAPIHono({
    strict: true,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment -- ignore type error
    // @ts-ignore - ignore type error
    defaultHook(result, c) {
      if (!result.success) {
        return c.json(
          {
            error: {
              name: 'ValidationError',
              message: 'Validation failed',
              details: result.error.issues.map((issue) => {
                const { code, path, message } = issue
                const detail: Record<string, unknown> = { code, path, message }
                if ('expected' in issue) {
                  detail.expected = (issue as unknown as { expected: unknown }).expected
                }
                return detail
              })
            }
          },
          HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY
        )
      }
    }
  })

  app.use('*', prettyJSON())
  app.use('*', compress())
  app.use('*', secureHeaders())
  app.use('*', corsMiddleware)
  app.use('*', loggerMiddleware)
  routes(app)
  app.notFound(notFoundHandler)
  app.onError(errorHandler)
  return app
}

export function createServer() {
  const app = buildApp()
  return serve(app)
}

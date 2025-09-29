import { serve } from '@hono/node-server'
import { OpenAPIHono } from '@hono/zod-openapi'
import { compress } from 'hono/compress'
import { prettyJSON } from 'hono/pretty-json'
import { secureHeaders } from 'hono/secure-headers'

import { corsMiddleware, errorHandler, loggerMiddleware, notFoundHandler } from './middlewares'
import { routes } from './routes/_routes'

export function buildApp(): OpenAPIHono {
  const app = new OpenAPIHono({ strict: true })
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

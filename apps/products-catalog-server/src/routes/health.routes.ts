import { type OpenAPIHono } from '@hono/zod-openapi'
import { productInventoryServerENV } from '@niki/env'
import { makeLoggerProvider } from '@niki/logger'
import { HTTP_STATUS_CODE } from '@niki/utils'

import { version } from '../../package.json'

export function healthRoutes(app: OpenAPIHono): void {
  app.get('/', (c) => {
    try {
      return c.json(
        {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          environment: productInventoryServerENV.ENVIRONMENT,
          version: version
        },
        HTTP_STATUS_CODE.OK
      )
    } catch (error) {
      makeLoggerProvider().sendLogError({
        message: 'Health check failed',
        value: error
      })
      return c.json(
        {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          environment: productInventoryServerENV.ENVIRONMENT,
          version: version,
          error: 'Health check failed'
        },
        HTTP_STATUS_CODE.SERVICE_UNAVAILABLE
      )
    }
  })
}

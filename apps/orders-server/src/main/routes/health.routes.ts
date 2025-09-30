import { type OpenAPIHono } from '@hono/zod-openapi'
import { Database } from '@infra/database/database'
import { ordersServerENV } from '@niki/env'
import { makeLoggerProvider } from '@niki/logger'

import { version } from '../../../package.json'

export function healthRoutes(app: OpenAPIHono): void {
  app.get('/', async (c) => {
    try {
      const databaseHealth = await Database.getInstance().healthCheck()

      const isHealthy = databaseHealth.isSuccess()
      const healthStatus = {
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        environment: ordersServerENV.ENVIRONMENT,
        version: version,
        services: {
          database: {
            status: databaseHealth.isSuccess() ? 'healthy' : 'unhealthy',
            ...(databaseHealth.isSuccess() ? databaseHealth.value : { error: databaseHealth.value })
          }
        }
      }

      makeLoggerProvider().sendLogInfo({
        message: 'Health check performed',
        data: healthStatus
      })

      return c.json(healthStatus, isHealthy ? 200 : 503)
    } catch (error) {
      makeLoggerProvider().sendLogError({
        message: 'Health check failed',
        value: error
      })
      return c.json(
        {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          environment: ordersServerENV.ENVIRONMENT,
          version: version,
          error: 'Health check failed'
        },
        503
      )
    }
  })
}

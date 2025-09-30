import { Elasticsearch } from '@elasticsearch/elasticsearch'
import { type OpenAPIHono } from '@hono/zod-openapi'
import { productsCatalogServerENV } from '@niki/env'
import { makeLoggerProvider } from '@niki/logger'
import { HTTP_STATUS_CODE } from '@niki/utils'

import { version } from '../../package.json'

import { healthRoute } from './health/health.routes'
import { HealthResponseSchema, UnhealthyHealthResponseSchema } from './health/health.schema'

export function healthRoutes(app: OpenAPIHono): void {
  // @ts-expect-error - ignore type error
  app.openapi(healthRoute, async (c) => {
    const logger = makeLoggerProvider()
    const startTime = performance.now()
    try {
      const elasticsearchHealth = await Elasticsearch.getInstance().healthCheck()
      const elasticsearchStatus = elasticsearchHealth.isSuccess() ? 'healthy' : 'unhealthy'
      const elasticsearchDetails = elasticsearchHealth.isSuccess()
        ? elasticsearchHealth.value
        : { error: elasticsearchHealth.value.message }
      const responseTime = performance.now() - startTime
      const overallStatus = elasticsearchStatus === 'healthy' ? 'healthy' : 'degraded'

      const statusCode = overallStatus === 'healthy' ? HTTP_STATUS_CODE.OK : HTTP_STATUS_CODE.SERVICE_UNAVAILABLE

      logger.sendLogInfo({
        message: 'Health check completed',
        data: { status: overallStatus, responseTime, elasticsearchStatus }
      })

      return c.json(
        HealthResponseSchema.safeParse({
          status: overallStatus,
          timestamp: new Date().toISOString(),
          environment: productsCatalogServerENV.ENVIRONMENT,
          version: version,
          responseTime: `${responseTime}ms`,
          error: elasticsearchHealth.isSuccess() ? '' : elasticsearchHealth.value.message,
          services: {
            elasticsearch: {
              status: elasticsearchStatus,
              details: elasticsearchDetails
            }
          },
          uptime: process.uptime(),
          memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
            external: Math.round(process.memoryUsage().external / 1024 / 1024)
          }
        }),
        statusCode
      )
    } catch (error) {
      const responseTime = performance.now() - startTime
      logger.sendLogError({
        message: 'Health check failed',
        value: { error, responseTime }
      })
      return c.json(
        UnhealthyHealthResponseSchema.safeParse({
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          environment: productsCatalogServerENV.ENVIRONMENT,
          version: version,
          responseTime: `${responseTime}ms`,
          error: 'Health check failed',
          services: {
            elasticsearch: { status: 'unhealthy', details: { error: 'Health check failed' } }
          }
        }),
        HTTP_STATUS_CODE.SERVICE_UNAVAILABLE
      )
    }
  })
}

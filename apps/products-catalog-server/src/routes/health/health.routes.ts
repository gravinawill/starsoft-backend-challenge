import { createRoute } from '@hono/zod-openapi'
import { ErrorResponseSchema } from '@schemas/shared.schemas'

import { HealthResponseSchema, UnhealthyHealthResponseSchema } from './health.schema'

export const healthRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Health'],
  operationId: 'get-health',
  summary: 'Get comprehensive health status',
  description: 'Returns detailed health information including service status, system metrics, and performance data',
  responses: {
    200: {
      description: 'Service is healthy',
      content: {
        'application/json': {
          schema: HealthResponseSchema
        }
      }
    },
    503: {
      description: 'Service is unhealthy or degraded',
      content: {
        'application/json': {
          schema: UnhealthyHealthResponseSchema
        }
      }
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: ErrorResponseSchema
        }
      }
    }
  }
})

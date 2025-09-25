import { type FastifyTypedInstance } from '@main/docs/openapi.docs'
import { type ZodTypeProvider } from '@marcalexiei/fastify-type-provider-zod'
import { usersServerENV } from '@niki/env'
import { makeLoggerProvider } from '@niki/logger'
import { HTTP_STATUS_CODE } from '@niki/utils'

import { version } from '../../../package.json'
import { Tags } from '../docs/tags.docs'
import { HealthCheckResponseSchema } from '../route-schemas/health.schema'

export function healthRoutes(fastify: FastifyTypedInstance): void {
  fastify.withTypeProvider<ZodTypeProvider>().get(
    '/',
    {
      schema: {
        description: 'Readiness check - returns 200 when service is ready to accept requests',
        summary: 'Service Health Check',
        tags: [Tags.HEALTH],
        operationId: 'health-check',
        response: {
          200: HealthCheckResponseSchema,
          503: HealthCheckResponseSchema
        }
      }
    },
    async (_request, reply) => {
      try {
        const payload = {
          status: 'ok',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          environment: usersServerENV.USERS_SERVER_ENVIRONMENT,
          version
        }

        const response = HealthCheckResponseSchema.safeParse(payload)
        if (!response.success) {
          return await reply.status(HTTP_STATUS_CODE.SERVICE_UNAVAILABLE).send({
            environment: usersServerENV.USERS_SERVER_ENVIRONMENT,
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            version,
            status: 'not_ready'
          })
        }

        return await reply.status(HTTP_STATUS_CODE.OK).send(response.data)
      } catch (error) {
        makeLoggerProvider().sendLogError({
          message: 'Failed to check health',
          value: error
        })

        const response = HealthCheckResponseSchema.safeParse({
          status: 'not_ready',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          environment: usersServerENV.USERS_SERVER_ENVIRONMENT,
          version
        })

        if (!response.success) {
          return await reply.status(HTTP_STATUS_CODE.SERVICE_UNAVAILABLE).send({
            environment: usersServerENV.USERS_SERVER_ENVIRONMENT,
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            version,
            status: 'not_ready'
          })
        }
        return await reply.status(HTTP_STATUS_CODE.SERVICE_UNAVAILABLE).send(response.data)
      }
    }
  )
}

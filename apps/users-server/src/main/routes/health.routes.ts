import { type FastifyTypedInstance } from '@main/docs/openapi.docs'
import { type ZodTypeProvider } from '@marcalexiei/fastify-type-provider-zod'
import { usersServerENV } from '@niki/env'
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
      return await reply.status(HTTP_STATUS_CODE.OK).send({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        environment: usersServerENV.ENVIRONMENT,
        version: version
      })
    }
  )
}

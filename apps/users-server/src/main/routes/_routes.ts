import { type FastifyTypedInstance } from '@main/docs/openapi.docs'

import { healthRoutes } from './health.routes'
import { usersRoutes } from './users/_users.route'

export function routes(fastify: FastifyTypedInstance): void {
  fastify.register(usersRoutes, { prefix: '/users' })
  fastify.register(healthRoutes, { prefix: '/health' })
}

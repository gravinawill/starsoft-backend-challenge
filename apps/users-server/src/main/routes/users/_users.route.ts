import { type FastifyTypedInstance } from '@main/docs/openapi.docs'

import { signInRoute } from './sign-in.route'
import { signUpRoute } from './sign-up.route'

export const usersRoutes = (fastify: FastifyTypedInstance): void => {
  fastify.register(signInRoute)
  fastify.register(signUpRoute)
}

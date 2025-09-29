import { signUpUserController } from '@controllers/users/sign-up-user.controller'
import { type FastifyTypedInstance } from '@main/docs/openapi.docs'
import { Tags } from '@main/docs/tags.docs'
import {
  SignUpErrorResponseSchema,
  SignUpRequestSchema,
  SignUpSuccessResponseSchema
} from '@main/route-schemas/users/sign-up.schema'
import { type ZodTypeProvider } from '@marcalexiei/fastify-type-provider-zod'
import { HTTP_STATUS_CODE } from '@niki/utils'

export function signUpRoute(fastify: FastifyTypedInstance): void {
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/sign-up',
    schema: {
      description:
        'Register a new user account with email, password, name, and role. Automatically authenticates the user and returns a JWT access token. Publishes user creation event to message broker.',
      summary: 'User Registration',
      tags: [Tags.USERS],
      body: SignUpRequestSchema,
      response: {
        [HTTP_STATUS_CODE.CREATED]: SignUpSuccessResponseSchema,
        [HTTP_STATUS_CODE.BAD_REQUEST]: SignUpErrorResponseSchema,
        [HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR]: SignUpErrorResponseSchema
      },
      operationId: 'users-sign-up'
    },
    handler: signUpUserController
  })
}

import { signInUserController } from '@controllers/users/sign-in-user.controller'
import { type FastifyTypedInstance } from '@main/docs/openapi.docs'
import { Tags } from '@main/docs/tags.docs'
import {
  SignInErrorResponseSchema,
  SignInRequestSchema,
  SignInSuccessResponseSchema
} from '@main/route-schemas/users/sign-in.schema'
import { type ZodTypeProvider } from '@marcalexiei/fastify-type-provider-zod'
import { HTTP_STATUS_CODE } from '@niki/utils'

export function signInRoute(fastify: FastifyTypedInstance): void {
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/sign-in',
    schema: {
      description:
        'Authenticate a user with email and password credentials. Returns a JWT access token upon successful authentication.',
      summary: 'User Authentication',
      tags: [Tags.USERS],
      body: SignInRequestSchema,
      operationId: 'users-sign-in',
      response: {
        [HTTP_STATUS_CODE.OK]: SignInSuccessResponseSchema,
        [HTTP_STATUS_CODE.BAD_REQUEST]: SignInErrorResponseSchema,
        [HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR]: SignInErrorResponseSchema
      }
    },
    handler: signInUserController
  })
}

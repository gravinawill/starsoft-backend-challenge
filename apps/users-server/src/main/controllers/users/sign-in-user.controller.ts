import { makeSignInUseCase } from '@factories/use-cases/users/sign-in.use-case.factory'
import { type SignInRequest, SignInSuccessResponseSchema } from '@main/route-schemas/users/sign-in.schema'
import { getHttpStatusCodeByStatusError } from '@niki/domain'
import { HTTP_STATUS_CODE } from '@niki/utils'
import { type FastifyReply, type FastifyRequest } from 'fastify'

export async function signInUserController(
  request: FastifyRequest<{ Body: SignInRequest }>,
  reply: FastifyReply
): Promise<void> {
  try {
    const result = await makeSignInUseCase().execute({ credentials: request.body.credentials })

    if (result.isFailure()) {
      const error = result.value
      return await reply.status(getHttpStatusCodeByStatusError({ status: error.status }).statusCode).send({
        success: null,
        error: {
          name: error.name,
          message: error.errorMessage || 'Failed to sign in user'
        }
      })
    }

    return await reply.status(HTTP_STATUS_CODE.OK).send(
      SignInSuccessResponseSchema.parse({
        success: { access_token: result.value.accessToken },
        error: null
      })
    )
  } catch {
    return await reply.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).send({
      success: null,
      error: {
        name: 'InternalServerError',
        message: 'An unexpected error occurred'
      }
    })
  }
}

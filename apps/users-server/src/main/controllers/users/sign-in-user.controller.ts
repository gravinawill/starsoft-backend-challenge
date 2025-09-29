import { makeSignInUseCase } from '@factories/use-cases/users/sign-in.use-case.factory'
import { fastifySendErrorResponse } from '@main/fastify-send-error-response'
import { type SignInRequest, SignInSuccessResponseSchema } from '@main/route-schemas/users/sign-in.schema'
import { STATUS_ERROR } from '@niki/domain'
import { HTTP_STATUS_CODE } from '@niki/utils'
import { type FastifyReply, type FastifyRequest } from 'fastify'

export async function signInUserController(
  request: FastifyRequest<{ Body: SignInRequest }>,
  reply: FastifyReply
): Promise<void> {
  try {
    const result = await makeSignInUseCase().execute({ credentials: request.body.credentials })
    if (result.isFailure()) return await fastifySendErrorResponse({ reply, error: result.value })
    return await reply
      .status(HTTP_STATUS_CODE.OK)
      .send(SignInSuccessResponseSchema.parse({ success: { access_token: result.value.accessToken }, error: null }))
  } catch {
    return await fastifySendErrorResponse({
      reply,
      error: {
        status: STATUS_ERROR.INTERNAL_ERROR,
        name: 'InternalServerError',
        errorMessage: 'An unexpected error occurred'
      }
    })
  }
}

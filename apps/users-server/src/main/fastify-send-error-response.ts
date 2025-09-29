import { getHttpStatusCodeByStatusError, type STATUS_ERROR } from '@niki/domain'
import { type FastifyReply } from 'fastify'

export function fastifySendErrorResponse(parameters: {
  reply: FastifyReply
  error: { status: STATUS_ERROR; name: string; errorMessage?: string }
}): FastifyReply {
  const statusCode = getHttpStatusCodeByStatusError({ status: parameters.error.status }).statusCode
  return parameters.reply.status(statusCode).send({
    success: null,
    error: {
      name: parameters.error.name,
      message: parameters.error.errorMessage ?? 'An unexpected error occurred'
    }
  })
}

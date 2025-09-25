import { makeSignInUseCase } from '@factories/use-cases/users/sign-in.use-case.factory'
import { makeSignUpUserUseCase } from '@factories/use-cases/users/sign-up-user-use-case.factory'
import { type SignUpRequest, SignUpSuccessResponseSchema } from '@main/route-schemas/users/sign-up.schema'
import { getHttpStatusCodeByStatusError } from '@niki/domain'
import { usersServerENV } from '@niki/env'
import { makeUsersProducerEvents } from '@niki/message-broker'
import { HTTP_STATUS_CODE } from '@niki/utils'
import { type FastifyReply, type FastifyRequest } from 'fastify'

export async function signUpUserController(
  request: FastifyRequest<{ Body: SignUpRequest }>,
  reply: FastifyReply
): Promise<void> {
  try {
    const signUpResult = await makeSignUpUserUseCase().execute({ user: request.body })

    if (signUpResult.isFailure()) {
      const error = signUpResult.value
      return await reply.status(getHttpStatusCodeByStatusError({ status: error.status }).statusCode).send({
        success: null,
        error: {
          name: error.name,
          message: error.errorMessage || 'Failed to create user account'
        }
      })
    }
    const { userCreated } = signUpResult.value

    makeUsersProducerEvents({
      environments: {
        BROKERS: [usersServerENV.USERS_SERVER_KAFKA_BROKER_URL],
        CLIENT_ID: 'users-server'
      }
    }).publishUserCreatedEvent({
      payload: {
        email: userCreated.email.value,
        name: userCreated.name,
        role: userCreated.role,
        userID: userCreated.id.toString()
      }
    })

    const resultSignInWithEmailAndPassword = await makeSignInUseCase().execute({
      user: { id: userCreated.id }
    })

    if (resultSignInWithEmailAndPassword.isFailure()) {
      return await reply
        .status(getHttpStatusCodeByStatusError({ status: resultSignInWithEmailAndPassword.value.status }).statusCode)
        .send({
          success: null,
          error: {
            name: resultSignInWithEmailAndPassword.value.name,
            message: resultSignInWithEmailAndPassword.value.errorMessage || 'Failed to sign in user'
          }
        })
    }

    const response = SignUpSuccessResponseSchema.safeParse({
      error: null,
      success: { access_token: resultSignInWithEmailAndPassword.value.accessToken }
    })

    if (!response.success) {
      return await reply.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).send({
        success: null,
        error: {
          name: 'InternalServerError',
          message: 'An unexpected error occurred'
        }
      })
    }

    return await reply.status(HTTP_STATUS_CODE.CREATED).send(response.data)
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

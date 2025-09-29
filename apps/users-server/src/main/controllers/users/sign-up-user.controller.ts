import { makeSignInUseCase } from '@factories/use-cases/users/sign-in.use-case.factory'
import { makeSignUpUserUseCase } from '@factories/use-cases/users/sign-up-user-use-case.factory'
import { fastifySendErrorResponse } from '@main/fastify-send-error-response'
import { type SignUpRequest, SignUpSuccessResponseSchema } from '@main/route-schemas/users/sign-up.schema'
import {
  STATUS_ERROR,
  UserRole,
  type UsersCustomerCreatedEventPayload,
  type UsersEmployeeCreatedEventPayload
} from '@niki/domain'
import { EventContractType } from '@niki/domain'
import { productInventoryServerENV } from '@niki/env'
import { ClientID, makeMessageBrokerProvider } from '@niki/message-broker'
import { HTTP_STATUS_CODE } from '@niki/utils'
import { type FastifyReply, type FastifyRequest } from 'fastify'

export async function signUpUserController(
  request: FastifyRequest<{ Body: SignUpRequest }>,
  reply: FastifyReply
): Promise<void> {
  try {
    const messageBrokerProvider = makeMessageBrokerProvider({
      brokers: [productInventoryServerENV.MESSAGE_BROKER_PROVIDER_BROKER_URL],
      clientID: ClientID.USERS_SERVER
    })
    const signUpResult = await makeSignUpUserUseCase().execute({ user: request.body })
    if (signUpResult.isFailure()) return await fastifySendErrorResponse({ reply, error: signUpResult.value })
    const { userCreated } = signUpResult.value
    await (userCreated.role === UserRole.CUSTOMER
      ? messageBrokerProvider.sendMessage<UsersCustomerCreatedEventPayload>({
          eventContractType: EventContractType.CUSTOMER_CREATED,
          payload: {
            userID: userCreated.id.toString(),
            name: userCreated.name,
            email: userCreated.email.value,
            createdAt: userCreated.createdAt,
            updatedAt: userCreated.updatedAt
          }
        })
      : messageBrokerProvider.sendMessage<UsersEmployeeCreatedEventPayload>({
          eventContractType: EventContractType.EMPLOYEE_CREATED,
          payload: {
            userID: userCreated.id.toString(),
            name: userCreated.name,
            email: userCreated.email.value,
            createdAt: userCreated.createdAt,
            updatedAt: userCreated.updatedAt
          }
        }))

    const resultSignInWithEmailAndPassword = await makeSignInUseCase().execute({ user: { id: userCreated.id } })
    if (resultSignInWithEmailAndPassword.isFailure()) {
      return await fastifySendErrorResponse({ reply, error: resultSignInWithEmailAndPassword.value })
    }

    const response = await SignUpSuccessResponseSchema.safeParseAsync({
      error: null,
      success: { access_token: resultSignInWithEmailAndPassword.value.accessToken }
    })
    if (!response.success) {
      return await fastifySendErrorResponse({
        reply,
        error: {
          status: STATUS_ERROR.INTERNAL_ERROR,
          name: 'InternalServerError',
          errorMessage: 'An unexpected error occurred'
        }
      })
    }
    return await reply.status(HTTP_STATUS_CODE.CREATED).send(response.data)
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

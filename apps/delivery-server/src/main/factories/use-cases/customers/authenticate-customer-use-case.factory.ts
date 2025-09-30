import { makeCustomersRepository } from '@factories/repositories/customers-repository.factory'
import { type UseCase } from '@niki/domain'
import { ordersServerENV } from '@niki/env'
import { makeLoggerProvider } from '@niki/logger'
import { makeTokenProvider } from '@niki/token'
import {
  AuthenticateCustomerUseCase,
  type AuthenticateCustomerUseCaseDTO
} from '@use-cases/customers/authenticate-customer.use-case'

export const makeAuthenticateCustomerUseCase: () => UseCase<
  AuthenticateCustomerUseCaseDTO.Parameters,
  AuthenticateCustomerUseCaseDTO.ResultFailure,
  AuthenticateCustomerUseCaseDTO.ResultSuccess
> = () =>
  new AuthenticateCustomerUseCase(
    makeLoggerProvider(),
    makeCustomersRepository(),
    makeTokenProvider({
      SECRET: ordersServerENV.TOKEN_PROVIDER_JWT_SECRET,
      EXPIRES_IN_MINUTES: ordersServerENV.TOKEN_PROVIDER_JWT_EXPIRES_IN_MINUTES,
      ALGORITHM: ordersServerENV.TOKEN_PROVIDER_JWT_ALGORITHM,
      ISSUER: ordersServerENV.TOKEN_PROVIDER_JWT_ISSUER
    })
  )

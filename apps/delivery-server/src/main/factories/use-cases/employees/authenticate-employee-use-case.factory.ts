import { makeEmployeesRepository } from '@factories/repositories/employees-repository.factory'
import { type UseCase } from '@niki/domain'
import { productsInventoryServerENV } from '@niki/env'
import { makeLoggerProvider } from '@niki/logger'
import { makeTokenProvider } from '@niki/token'
import {
  AuthenticateEmployeeUseCase,
  type AuthenticateEmployeeUseCaseDTO
} from '@use-cases/employees/authenticate-employee.use-case'

export const makeAuthenticateEmployeeUseCase: () => UseCase<
  AuthenticateEmployeeUseCaseDTO.Parameters,
  AuthenticateEmployeeUseCaseDTO.ResultFailure,
  AuthenticateEmployeeUseCaseDTO.ResultSuccess
> = () =>
  new AuthenticateEmployeeUseCase(
    makeLoggerProvider(),
    makeEmployeesRepository(),
    makeTokenProvider({
      SECRET: productsInventoryServerENV.TOKEN_PROVIDER_JWT_SECRET,
      EXPIRES_IN_MINUTES: productsInventoryServerENV.TOKEN_PROVIDER_JWT_EXPIRES_IN_MINUTES,
      ALGORITHM: productsInventoryServerENV.TOKEN_PROVIDER_JWT_ALGORITHM,
      ISSUER: productsInventoryServerENV.TOKEN_PROVIDER_JWT_ISSUER
    })
  )

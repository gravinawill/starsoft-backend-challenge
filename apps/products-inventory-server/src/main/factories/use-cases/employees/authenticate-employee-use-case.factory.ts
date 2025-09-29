import { makeEmployeesRepository } from '@factories/repositories/employees-repository.factory'
import { type UseCase } from '@niki/domain'
import { productInventoryServerENV } from '@niki/env'
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
      SECRET: productInventoryServerENV.TOKEN_PROVIDER_JWT_SECRET,
      EXPIRES_IN_MINUTES: productInventoryServerENV.TOKEN_PROVIDER_JWT_EXPIRES_IN_MINUTES,
      ALGORITHM: productInventoryServerENV.TOKEN_PROVIDER_JWT_ALGORITHM,
      ISSUER: productInventoryServerENV.TOKEN_PROVIDER_JWT_ISSUER
    })
  )

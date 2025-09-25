import { makeUsersRepository } from '@factories/repositories/users-repository.factory'
import { makeCryptoProvider } from '@niki/crypto'
import { type UseCase } from '@niki/domain'
import { usersServerENV } from '@niki/env'
import { makeLoggerProvider } from '@niki/logger'
import { makeTokenProvider } from '@niki/token'
import { SignInUseCase, type SignInUseCaseDTO } from '@use-cases/users/sign-in-user.use-case'

export const makeSignInUseCase = (): UseCase<
  SignInUseCaseDTO.Parameters,
  SignInUseCaseDTO.ResultFailure,
  SignInUseCaseDTO.ResultSuccess
> =>
  new SignInUseCase(
    makeLoggerProvider(),
    makeUsersRepository(),
    makeCryptoProvider(),
    makeTokenProvider({
      SECRET: usersServerENV.USERS_SERVER_JWT_SECRET,
      EXPIRES_IN_MINUTES: usersServerENV.USERS_SERVER_JWT_EXPIRES_IN_MINUTES,
      ALGORITHM: usersServerENV.USERS_SERVER_JWT_ALGORITHM,
      ISSUER: usersServerENV.USERS_SERVER_JWT_ISSUER
    })
  )

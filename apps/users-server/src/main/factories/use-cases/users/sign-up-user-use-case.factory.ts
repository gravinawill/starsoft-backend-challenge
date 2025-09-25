import { makeUsersRepository } from '@factories/repositories/users-repository.factory'
import { makeCryptoProvider } from '@niki/crypto'
import { type UseCase } from '@niki/domain'
import { makeLoggerProvider } from '@niki/logger'
import { SignUpUserUseCase, type SignUpUserUseCaseDTO } from '@use-cases/users/sign-up-user.use-case'

export const makeSignUpUserUseCase = (): UseCase<
  SignUpUserUseCaseDTO.Parameters,
  SignUpUserUseCaseDTO.ResultFailure,
  SignUpUserUseCaseDTO.ResultSuccess
> => new SignUpUserUseCase(makeLoggerProvider(), makeUsersRepository(), makeCryptoProvider())

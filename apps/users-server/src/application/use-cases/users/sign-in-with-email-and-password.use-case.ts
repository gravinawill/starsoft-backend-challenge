import { InvalidUserEmailOrPasswordError } from '@errors/index'
import {
  Email,
  EmailNotFoundError,
  type ICompareEncryptedPasswordCryptoProvider,
  type IGenerateJWTTokenProvider,
  type InvalidEmailError,
  type InvalidIDError,
  type InvalidPasswordFormatError,
  type ISendLogErrorLoggerProvider,
  type ISendLogTimeUseCaseLoggerProvider,
  Password,
  type ProviderError,
  type RepositoryError,
  UseCase
} from '@niki/domain'
import { type Either, failure, success } from '@niki/utils'
import { type ISaveUsersRepository } from '@repository-contracts/users/save.users-repository'
import { type IValidateEmailUsersRepository } from '@repository-contracts/users/validate-email.users-repository'

export namespace SignInWithEmailAndPasswordUseCaseDTO {
  export type Parameters = Readonly<{ credentials: { email: string; password: string } }>

  export type ResultFailure = Readonly<
    | InvalidPasswordFormatError
    | InvalidEmailError
    | EmailNotFoundError
    | InvalidIDError
    | RepositoryError
    | ProviderError
    | InvalidUserEmailOrPasswordError
  >
  export type ResultSuccess = Readonly<{ accessToken: string }>

  export type Result = Promise<Either<ResultFailure, ResultSuccess>>
}

export class SignInWithEmailAndPasswordUseCase extends UseCase<
  SignInWithEmailAndPasswordUseCaseDTO.Parameters,
  SignInWithEmailAndPasswordUseCaseDTO.ResultFailure,
  SignInWithEmailAndPasswordUseCaseDTO.ResultSuccess
> {
  constructor(
    loggerProvider: ISendLogTimeUseCaseLoggerProvider & ISendLogErrorLoggerProvider,
    private readonly usersRepository: IValidateEmailUsersRepository & ISaveUsersRepository,
    private readonly cryptoProvider: ICompareEncryptedPasswordCryptoProvider,
    private readonly tokenProvider: IGenerateJWTTokenProvider
  ) {
    super(loggerProvider)
  }

  protected async performOperation(
    parameters: SignInWithEmailAndPasswordUseCaseDTO.Parameters
  ): SignInWithEmailAndPasswordUseCaseDTO.Result {
    const resultValidatePassword = Password.validateDecryptedPassword({ password: parameters.credentials.password })
    if (resultValidatePassword.isFailure()) return failure(resultValidatePassword.value)
    const { passwordValidated } = resultValidatePassword.value

    const resultValidateUserEmail = Email.validateEmail({ email: parameters.credentials.email, isVerified: false })
    if (resultValidateUserEmail.isFailure()) return failure(resultValidateUserEmail.value)
    const { emailValidated } = resultValidateUserEmail.value
    const resultVerifyEmailExists = await this.usersRepository.validateEmail({ user: { email: emailValidated } })
    if (resultVerifyEmailExists.isFailure()) return failure(resultVerifyEmailExists.value)
    const { foundUser: foundUserEmail } = resultVerifyEmailExists.value
    if (foundUserEmail === null) return failure(new EmailNotFoundError({ email: emailValidated }))
    if (foundUserEmail.email !== emailValidated) return failure(new EmailNotFoundError({ email: emailValidated }))

    const resultComparePassword = await this.cryptoProvider.compareEncryptedPassword({
      passwordDecrypted: passwordValidated,
      passwordEncrypted: foundUserEmail.password
    })
    if (resultComparePassword.isFailure()) return failure(resultComparePassword.value)
    const { isPasswordMatch } = resultComparePassword.value
    if (!isPasswordMatch) return failure(new InvalidUserEmailOrPasswordError({ email: emailValidated }))

    const resultGenerateAccessToken = this.tokenProvider.generateJWT({ userID: foundUserEmail.id })
    if (resultGenerateAccessToken.isFailure()) return failure(resultGenerateAccessToken.value)
    const { jwtToken } = resultGenerateAccessToken.value

    return success({ accessToken: jwtToken })
  }
}

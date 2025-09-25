import { InvalidSignInUseCaseParametersError } from '@errors/index'
import {
  Email,
  EmailNotFoundError,
  type ICompareEncryptedPasswordCryptoProvider,
  type ID,
  type IGenerateJWTTokenProvider,
  type InvalidEmailError,
  type InvalidIDError,
  type InvalidPasswordFormatError,
  InvalidUserEmailOrPasswordError,
  type ISendLogErrorLoggerProvider,
  type ISendLogTimeUseCaseLoggerProvider,
  Password,
  type ProviderError,
  type RepositoryError,
  UseCase,
  type User
} from '@niki/domain'
import { type Either, failure, success } from '@niki/utils'
import { type IValidateEmailUsersRepository } from '@repository-contracts/users/validate-email.users-repository'

export namespace SignInUseCaseDTO {
  export type Parameters = Readonly<{ credentials: { email: string; password: string } } | { user: Pick<User, 'id'> }>

  export type ResultFailure = Readonly<
    | InvalidPasswordFormatError
    | InvalidEmailError
    | EmailNotFoundError
    | InvalidIDError
    | RepositoryError
    | ProviderError
    | InvalidSignInUseCaseParametersError
    | InvalidUserEmailOrPasswordError
  >
  export type ResultSuccess = Readonly<{ accessToken: string }>

  export type Result = Promise<Either<ResultFailure, ResultSuccess>>
}

export class SignInUseCase extends UseCase<
  SignInUseCaseDTO.Parameters,
  SignInUseCaseDTO.ResultFailure,
  SignInUseCaseDTO.ResultSuccess
> {
  constructor(
    loggerProvider: ISendLogTimeUseCaseLoggerProvider & ISendLogErrorLoggerProvider,
    private readonly usersRepository: IValidateEmailUsersRepository,
    private readonly cryptoProvider: ICompareEncryptedPasswordCryptoProvider,
    private readonly tokenProvider: IGenerateJWTTokenProvider
  ) {
    super(loggerProvider)
  }

  protected async performOperation(parameters: SignInUseCaseDTO.Parameters): SignInUseCaseDTO.Result {
    let userID: null | ID = null
    if ('credentials' in parameters) {
      const resultSignInWithEmailAndPassword = await this.signInWithEmailAndPassword(parameters)
      if (resultSignInWithEmailAndPassword.isFailure()) return failure(resultSignInWithEmailAndPassword.value)
      userID = resultSignInWithEmailAndPassword.value.user.id
    }
    if ('user' in parameters) userID = parameters.user.id
    if (userID === null) return failure(new InvalidSignInUseCaseParametersError())
    const resultGenerateAccessToken = this.generateAccessToken({ user: { id: userID } })
    if (resultGenerateAccessToken.isFailure()) return failure(resultGenerateAccessToken.value)
    const { accessToken } = resultGenerateAccessToken.value
    return success({ accessToken })
  }

  private async signInWithEmailAndPassword(parameters: {
    credentials: { email: string; password: string }
  }): Promise<
    Either<
      | InvalidPasswordFormatError
      | InvalidEmailError
      | EmailNotFoundError
      | InvalidUserEmailOrPasswordError
      | RepositoryError
      | InvalidIDError
      | ProviderError,
      { user: Pick<User, 'id'> }
    >
  > {
    const resultValidatePassword = Password.validateDecryptedPassword({ password: parameters.credentials.password })
    if (resultValidatePassword.isFailure()) return failure(resultValidatePassword.value)
    const { passwordValidated } = resultValidatePassword.value
    const resultValidateUserEmail = Email.validateEmail({ email: parameters.credentials.email, isVerified: false })
    if (resultValidateUserEmail.isFailure()) return failure(resultValidateUserEmail.value)
    const { emailValidated } = resultValidateUserEmail.value
    const resultVerifyEmailExists = await this.usersRepository.validateEmail({ user: { email: emailValidated } })
    if (resultVerifyEmailExists.isFailure()) return failure(resultVerifyEmailExists.value)
    const { foundUser } = resultVerifyEmailExists.value
    if (foundUser === null) return failure(new EmailNotFoundError({ email: emailValidated }))
    if (!foundUser.email.equals({ emailToCompare: emailValidated })) {
      return failure(new EmailNotFoundError({ email: emailValidated }))
    }
    const resultComparePassword = await this.cryptoProvider.compareEncryptedPassword({
      passwordDecrypted: passwordValidated,
      passwordEncrypted: foundUser.password
    })
    if (resultComparePassword.isFailure()) return failure(resultComparePassword.value)
    const { isPasswordMatch } = resultComparePassword.value
    if (!isPasswordMatch) return failure(new InvalidUserEmailOrPasswordError({ email: emailValidated }))
    return success({ user: foundUser })
  }

  private generateAccessToken(parameters: { user: Pick<User, 'id'> }): Either<ProviderError, { accessToken: string }> {
    const resultGenerateAccessToken = this.tokenProvider.generateJWT({ userID: parameters.user.id })
    if (resultGenerateAccessToken.isFailure()) return failure(resultGenerateAccessToken.value)
    const { jwtToken } = resultGenerateAccessToken.value
    return success({ accessToken: jwtToken })
  }
}

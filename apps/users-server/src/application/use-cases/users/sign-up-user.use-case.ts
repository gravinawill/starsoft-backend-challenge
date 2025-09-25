import {
  Email,
  EmailAlreadyInUseError,
  type GenerateIDError,
  type IEncryptPasswordCryptoProvider,
  type InvalidEmailError,
  type InvalidIDError,
  type InvalidPasswordFormatError,
  type InvalidUserNameError,
  type InvalidUserRoleError,
  type ISendLogErrorLoggerProvider,
  type ISendLogTimeUseCaseLoggerProvider,
  Password,
  type ProviderError,
  type RepositoryError,
  UseCase,
  User
} from '@niki/domain'
import { type Either, failure, success } from '@niki/utils'
import { type ISaveUsersRepository } from '@repository-contracts/users/save.users-repository'
import { type IValidateEmailUsersRepository } from '@repository-contracts/users/validate-email.users-repository'

export namespace SignUpUserUseCaseDTO {
  export type Parameters = Readonly<{
    user: {
      name: string
      email: string
      password: string
      role: string
    }
  }>

  export type ResultFailure = Readonly<
    | InvalidUserNameError
    | InvalidPasswordFormatError
    | InvalidEmailError
    | InvalidIDError
    | ProviderError
    | RepositoryError
    | EmailAlreadyInUseError
    | InvalidUserRoleError
    | GenerateIDError
  >
  export type ResultSuccess = Readonly<{
    userCreated: Pick<User, 'id' | 'name' | 'email' | 'role' | 'createdAt' | 'updatedAt' | 'deletedAt'>
  }>

  export type Result = Promise<Either<ResultFailure, ResultSuccess>>
}

export class SignUpUserUseCase extends UseCase<
  SignUpUserUseCaseDTO.Parameters,
  SignUpUserUseCaseDTO.ResultFailure,
  SignUpUserUseCaseDTO.ResultSuccess
> {
  constructor(
    loggerProvider: ISendLogTimeUseCaseLoggerProvider & ISendLogErrorLoggerProvider,
    private readonly usersRepository: IValidateEmailUsersRepository & ISaveUsersRepository,
    private readonly cryptoProvider: IEncryptPasswordCryptoProvider
  ) {
    super(loggerProvider)
  }

  protected async performOperation(parameters: SignUpUserUseCaseDTO.Parameters): SignUpUserUseCaseDTO.Result {
    const resultValidateRoles = User.validateRole({ role: parameters.user.role, user: null })
    if (resultValidateRoles.isFailure()) return failure(resultValidateRoles.value)
    const { roleValidated } = resultValidateRoles.value

    const resultValidateUserName = User.validateName({ name: parameters.user.name, userID: null })
    if (resultValidateUserName.isFailure()) return failure(resultValidateUserName.value)
    const { nameValidated } = resultValidateUserName.value

    const resultValidatePassword = Password.validateDecryptedPassword({ password: parameters.user.password })
    if (resultValidatePassword.isFailure()) return failure(resultValidatePassword.value)
    const { passwordValidated } = resultValidatePassword.value
    const resultEncryptPassword = await this.cryptoProvider.encryptPassword({ password: passwordValidated })
    if (resultEncryptPassword.isFailure()) return failure(resultEncryptPassword.value)
    const { passwordEncrypted } = resultEncryptPassword.value

    const resultValidateUserEmail = Email.validateEmail({ email: parameters.user.email, isVerified: false })
    if (resultValidateUserEmail.isFailure()) return failure(resultValidateUserEmail.value)
    const { emailValidated } = resultValidateUserEmail.value
    const resultVerifyEmailExists = await this.usersRepository.validateEmail({ user: { email: emailValidated } })
    if (resultVerifyEmailExists.isFailure()) return failure(resultVerifyEmailExists.value)
    const { foundUser: foundUserEmail } = resultVerifyEmailExists.value
    if (foundUserEmail !== null) return failure(new EmailAlreadyInUseError({ email: emailValidated }))

    const resultCreateUser = User.create({
      name: nameValidated,
      email: emailValidated,
      password: passwordEncrypted,
      role: roleValidated
    })
    if (resultCreateUser.isFailure()) return failure(resultCreateUser.value)
    const { userCreated } = resultCreateUser.value

    const resultSaveUser = await this.usersRepository.save({ user: userCreated })
    if (resultSaveUser.isFailure()) return failure(resultSaveUser.value)

    return success({
      userCreated: {
        id: userCreated.id,
        name: userCreated.name,
        email: userCreated.email,
        role: userCreated.role,
        createdAt: userCreated.createdAt,
        updatedAt: userCreated.updatedAt,
        deletedAt: userCreated.deletedAt
      }
    })
  }
}

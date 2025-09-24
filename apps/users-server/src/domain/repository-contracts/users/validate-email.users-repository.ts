import { type User } from '@models/index'
import { type InvalidEmailError, type InvalidIDError, type RepositoryError } from '@niki/domain'
import { type Either } from '@niki/utils'

export namespace ValidateEmailUsersRepositoryDTO {
  export type Parameters = Readonly<{ user: Pick<User, 'email'> }>

  export type ResultFailure = Readonly<RepositoryError | InvalidEmailError | InvalidIDError>
  export type ResultSuccess = Readonly<{
    foundUser: null | Pick<User, 'id' | 'email' | 'password'>
  }>

  export type Result = Promise<Either<ResultFailure, ResultSuccess>>
}

export interface IValidateEmailUsersRepository {
  validateEmail(parameters: ValidateEmailUsersRepositoryDTO.Parameters): ValidateEmailUsersRepositoryDTO.Result
}

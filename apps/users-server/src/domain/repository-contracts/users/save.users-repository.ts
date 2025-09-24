import { type User } from '@models/user.model'
import { type RepositoryError } from '@niki/domain'
import { type Either } from '@niki/utils'

export namespace SaveUsersRepositoryDTO {
  export type Parameters = Readonly<{ user: User }>

  export type ResultFailure = Readonly<RepositoryError>
  export type ResultSuccess = Readonly<null>

  export type Result = Promise<Either<ResultFailure, ResultSuccess>>
}

export interface ISaveUsersRepository {
  save(parameters: SaveUsersRepositoryDTO.Parameters): SaveUsersRepositoryDTO.Result
}

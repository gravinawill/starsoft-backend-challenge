import { type Order } from '@models/order.model'
import { type RepositoryError } from '@niki/domain'
import { type Either } from '@niki/utils'

export namespace SaveOrdersRepositoryDTO {
  export type Parameters = Readonly<{ order: Order }>

  export type ResultFailure = Readonly<RepositoryError>
  export type ResultSuccess = Readonly<null>

  export type Result = Promise<Either<ResultFailure, ResultSuccess>>
}

export interface ISaveOrdersRepository {
  save(parameters: SaveOrdersRepositoryDTO.Parameters): SaveOrdersRepositoryDTO.Result
}

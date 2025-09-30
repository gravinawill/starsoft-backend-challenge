import { type Order } from '@models/order.model'
import { type InvalidIDError, type RepositoryError } from '@niki/domain'
import { type Either } from '@niki/utils'

export namespace ValidateIDOrdersRepositoryDTO {
  export type Parameters = Readonly<{ order: Pick<Order, 'id'> }>

  export type ResultFailure = Readonly<RepositoryError | InvalidIDError>
  export type ResultSuccess = Readonly<{
    foundOrder: null | Pick<Order, 'id'>
  }>

  export type Result = Promise<Either<ResultFailure, ResultSuccess>>
}

export interface IValidateIDOrdersRepository {
  validateID(parameters: ValidateIDOrdersRepositoryDTO.Parameters): ValidateIDOrdersRepositoryDTO.Result
}

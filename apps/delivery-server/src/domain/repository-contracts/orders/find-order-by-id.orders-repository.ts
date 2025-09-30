import { type Customer } from '@models/customer.model'
import { type Order } from '@models/order.model'
import { type InvalidIDError, type InvalidOrderStatusError, type RepositoryError } from '@niki/domain'
import { type Either } from '@niki/utils'

export namespace FindOrderByIDOrdersRepositoryDTO {
  export type Parameters = Readonly<{ order: Pick<Order, 'id'> }>

  export type ResultFailure = Readonly<RepositoryError | InvalidIDError | InvalidOrderStatusError>
  export type ResultSuccess = Readonly<{
    foundOrder:
      | null
      | (Pick<Order, 'id' | 'customer'> & {
          customer: Pick<Customer, 'id' | 'name'>
        })
  }>

  export type Result = Promise<Either<ResultFailure, ResultSuccess>>
}

export interface IFindOrderByIDOrdersRepository {
  findByID(parameters: FindOrderByIDOrdersRepositoryDTO.Parameters): FindOrderByIDOrdersRepositoryDTO.Result
}

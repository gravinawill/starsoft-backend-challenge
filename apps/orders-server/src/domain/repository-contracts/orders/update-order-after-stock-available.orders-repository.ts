import { type Order } from '@models/order.model'
import { type RepositoryError } from '@niki/domain'
import { type Either } from '@niki/utils'

export namespace UpdateOrderAfterStockAvailableOrdersRepositoryDTO {
  export type Parameters = Readonly<{
    order: Pick<Order, 'id' | 'totalAmountInCents' | 'updatedAt' | 'status'>
  }>

  export type ResultFailure = Readonly<RepositoryError>
  export type ResultSuccess = Readonly<null>

  export type Result = Promise<Either<ResultFailure, ResultSuccess>>
}

export interface IUpdateOrderAfterStockAvailableOrdersRepository {
  updateOrderAfterStockAvailable(
    parameters: UpdateOrderAfterStockAvailableOrdersRepositoryDTO.Parameters
  ): UpdateOrderAfterStockAvailableOrdersRepositoryDTO.Result
}

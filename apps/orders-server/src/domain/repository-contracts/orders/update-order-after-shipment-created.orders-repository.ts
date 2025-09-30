import { type Order } from '@models/order.model'
import { type RepositoryError } from '@niki/domain'
import { type Either } from '@niki/utils'

export namespace UpdateOrderAfterShipmentCreatedOrdersRepositoryDTO {
  export type Parameters = Readonly<{
    order: Pick<Order, 'id' | 'updatedAt' | 'status'>
  }>

  export type ResultFailure = Readonly<RepositoryError>
  export type ResultSuccess = Readonly<null>

  export type Result = Promise<Either<ResultFailure, ResultSuccess>>
}

export interface IUpdateOrderAfterShipmentCreatedOrdersRepository {
  updateOrderAfterShipmentCreated(
    parameters: UpdateOrderAfterShipmentCreatedOrdersRepositoryDTO.Parameters
  ): UpdateOrderAfterShipmentCreatedOrdersRepositoryDTO.Result
}

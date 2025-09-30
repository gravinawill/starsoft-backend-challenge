import { type Order } from '@models/order.model'
import { type RepositoryError } from '@niki/domain'
import { type Either } from '@niki/utils'

export namespace UpdateOrderProductsReservationRepositoryDTO {
  export type Parameters = Readonly<{ order: Pick<Order, 'id' | 'orderProductReservation' | 'updatedAt'> }>

  export type ResultFailure = Readonly<RepositoryError>
  export type ResultSuccess = Readonly<null>

  export type Result = Promise<Either<ResultFailure, ResultSuccess>>
}

export interface IUpdateOrderProductsReservationRepository {
  updateOrderProductsReservation(
    parameters: UpdateOrderProductsReservationRepositoryDTO.Parameters
  ): UpdateOrderProductsReservationRepositoryDTO.Result
}

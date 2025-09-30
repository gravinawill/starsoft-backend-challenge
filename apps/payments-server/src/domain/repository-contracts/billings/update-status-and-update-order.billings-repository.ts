import { type Billing } from '@models/billing.model'
import { type Order } from '@models/order.model'
import { type RepositoryError } from '@niki/domain'
import { type Either } from '@niki/utils'

export namespace UpdateStatusAndUpdateOrderBillingsRepositoryDTO {
  export type Parameters = Readonly<{
    billing: Pick<Billing, 'id' | 'status' | 'updatedAt'>
    order: Pick<Order, 'id' | 'status' | 'updatedAt'>
  }>

  export type ResultFailure = Readonly<RepositoryError>
  export type ResultSuccess = Readonly<null>

  export type Result = Promise<Either<ResultFailure, ResultSuccess>>
}

export interface IUpdateStatusAndUpdateOrderBillingsRepository {
  updateStatusAndOrder(
    parameters: UpdateStatusAndUpdateOrderBillingsRepositoryDTO.Parameters
  ): UpdateStatusAndUpdateOrderBillingsRepositoryDTO.Result
}

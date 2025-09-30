import { type Billing } from '@models/billing.model'
import { type Order } from '@models/order.model'
import { type RepositoryError } from '@niki/domain'
import { type Either } from '@niki/utils'

export namespace SaveAndUpdateOrderBillingsRepositoryDTO {
  export type Parameters = Readonly<{
    billing: Billing
    order: Pick<Order, 'id' | 'status' | 'updatedAt' | 'totalAmountInCents'>
  }>

  export type ResultFailure = Readonly<RepositoryError>
  export type ResultSuccess = Readonly<null>

  export type Result = Promise<Either<ResultFailure, ResultSuccess>>
}

export interface ISaveAndUpdateOrderBillingsRepository {
  save(parameters: SaveAndUpdateOrderBillingsRepositoryDTO.Parameters): SaveAndUpdateOrderBillingsRepositoryDTO.Result
}

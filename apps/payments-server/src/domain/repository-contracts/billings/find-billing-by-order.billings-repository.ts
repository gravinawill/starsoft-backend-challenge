import { type Billing } from '@models/billing.model'
import { type Order } from '@models/order.model'
import {
  type InvalidBillingStatusError,
  type InvalidIDError,
  type InvalidOrderStatusError,
  type RepositoryError
} from '@niki/domain'
import { type Either } from '@niki/utils'

export namespace FindBillingByOrderBillingsRepositoryDTO {
  export type Parameters = Readonly<{ order: Pick<Order, 'id'> }>

  export type ResultFailure = Readonly<
    RepositoryError | InvalidIDError | InvalidOrderStatusError | InvalidBillingStatusError
  >
  export type ResultSuccess = Readonly<{
    foundBilling: null | Billing
  }>

  export type Result = Promise<Either<ResultFailure, ResultSuccess>>
}

export interface IFindBillingByOrderBillingsRepository {
  findByOrder(
    parameters: FindBillingByOrderBillingsRepositoryDTO.Parameters
  ): FindBillingByOrderBillingsRepositoryDTO.Result
}

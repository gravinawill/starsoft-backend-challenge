import type { Order } from '@models/order.model'

import { type Billing } from '@models/billing.model'
import { type InvalidIDError, type RepositoryError } from '@niki/domain'
import { type Either } from '@niki/utils'

export namespace FindBillingByExternalIDBillingsRepositoryDTO {
  export type Parameters = Readonly<{ billing: Pick<Billing, 'paymentGatewayBillingID'> }>

  export type ResultFailure = Readonly<RepositoryError | InvalidIDError>
  export type ResultSuccess = Readonly<{
    foundBilling:
      | (Pick<
          Billing,
          'paymentGatewayBillingID' | 'id' | 'status' | 'customer' | 'order' | 'amountInCents' | 'paymentMethod'
        > & {
          order: Pick<Order, 'id' | 'status' | 'updatedAt'>
        })
      | null
  }>

  export type Result = Promise<Either<ResultFailure, ResultSuccess>>
}

export interface IFindBillingByExternalIDBillingsRepository {
  findByExternalID(
    parameters: FindBillingByExternalIDBillingsRepositoryDTO.Parameters
  ): FindBillingByExternalIDBillingsRepositoryDTO.Result
}

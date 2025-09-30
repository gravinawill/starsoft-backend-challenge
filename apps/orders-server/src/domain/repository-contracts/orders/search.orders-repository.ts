import { type Customer } from '@models/customer.model'
import { type Order, type OrderStatus, type PaymentMethod } from '@models/order.model'
import { type ID, type InvalidIDError, type RepositoryError } from '@niki/domain'
import { type Either } from '@niki/utils'

export namespace SearchOrdersRepositoryDTO {
  export type Parameters = Readonly<{
    customer: Pick<Customer, 'id'>
    filters: {
      status?: OrderStatus
      rangeDate?: {
        startDate: Date
        endDate: Date
      }
      paymentMethod?: PaymentMethod
      totalAmountInCents?: {
        min?: number
        max?: number
      }
      id?: ID
    }
    pagination: {
      from: number
      size: number
    }
  }>

  export type ResultFailure = Readonly<RepositoryError | InvalidIDError>
  export type ResultSuccess = Readonly<{
    foundOrders: Array<
      Pick<Order, 'id' | 'status' | 'createdAt' | 'products' | 'customer' | 'paymentMethod' | 'totalAmountInCents'>
    >
    totalCount: number
  }>

  export type Result = Promise<Either<ResultFailure, ResultSuccess>>
}

export interface ISearchOrdersRepository {
  search(parameters: SearchOrdersRepositoryDTO.Parameters): SearchOrdersRepositoryDTO.Result
}

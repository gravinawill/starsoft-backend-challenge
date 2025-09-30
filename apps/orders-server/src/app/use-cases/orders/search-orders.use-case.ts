import { type Customer } from '@models/customer.model'
import { type Order, type OrderStatus, type PaymentMethod } from '@models/order.model'
import {
  type ID,
  type InvalidIDError,
  type ISendLogErrorLoggerProvider,
  type ISendLogTimeUseCaseLoggerProvider,
  type RepositoryError,
  UseCase
} from '@niki/domain'
import { type Either, failure, success } from '@niki/utils'
import {
  type ISearchOrdersRepository,
  type SearchOrdersRepositoryDTO
} from '@repository-contracts/orders/search.orders-repository'

export namespace SearchOrdersUseCaseDTO {
  export type Parameters = Readonly<{
    customer: Pick<Customer, 'id'>
    filters?: {
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
      page: number
      size: number
    }
  }>

  export type ResultFailure = Readonly<RepositoryError | InvalidIDError>
  export type ResultSuccess = Readonly<{
    orders: Array<Pick<Order, 'id' | 'status' | 'createdAt' | 'products' | 'paymentMethod' | 'totalAmountInCents'>>
    totalCount: number
  }>

  export type Result = Promise<Either<ResultFailure, ResultSuccess>>
}

export class SearchOrdersUseCase extends UseCase<
  SearchOrdersUseCaseDTO.Parameters,
  SearchOrdersUseCaseDTO.ResultFailure,
  SearchOrdersUseCaseDTO.ResultSuccess
> {
  constructor(
    loggerProvider: ISendLogTimeUseCaseLoggerProvider & ISendLogErrorLoggerProvider,
    private readonly ordersRepository: ISearchOrdersRepository
  ) {
    super(loggerProvider)
  }

  protected async performOperation(parameters: SearchOrdersUseCaseDTO.Parameters): SearchOrdersUseCaseDTO.Result {
    const searchParameters: SearchOrdersRepositoryDTO.Parameters = {
      customer: parameters.customer,
      filters: parameters.filters ?? {},
      pagination: {
        from: parameters.pagination.page,
        size: parameters.pagination.size
      }
    }

    const resultSearch = await this.ordersRepository.search(searchParameters)
    if (resultSearch.isFailure()) return failure(resultSearch.value)

    const { foundOrders, totalCount } = resultSearch.value

    return success({
      orders: foundOrders.map((order) => ({
        id: order.id,
        status: order.status,
        createdAt: order.createdAt,
        products: order.products,
        paymentMethod: order.paymentMethod,
        totalAmountInCents: order.totalAmountInCents
      })),
      totalCount
    })
  }
}

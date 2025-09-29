import { type Customer } from '@models/customer.model'
import { type Order } from '@models/order.model'
import { type ISendLogErrorLoggerProvider, type ISendLogTimeUseCaseLoggerProvider, UseCase } from '@niki/domain'
import { type Either, failure, success } from '@niki/utils'

export namespace ListOrdersUseCaseDTO {
  export type Parameters = Readonly<{ customer: Pick<Customer, 'id'> }>

  export type ResultFailure = Readonly<undefined>
  export type ResultSuccess = Readonly<{
    orders: Array<Pick<Order, 'id' | 'status' | 'createdAt' | 'products' | 'paymentMethod' | 'totalAmountInCents'>>
  }>

  export type Result = Promise<Either<ResultFailure, ResultSuccess>>
}

export class ListOrdersUseCase extends UseCase<
  ListOrdersUseCaseDTO.Parameters,
  ListOrdersUseCaseDTO.ResultFailure,
  ListOrdersUseCaseDTO.ResultSuccess
> {
  constructor(
    loggerProvider: ISendLogTimeUseCaseLoggerProvider & ISendLogErrorLoggerProvider,
    private readonly ordersRepository: IFindAllByCustomerIDOrdersRepository
  ) {
    super(loggerProvider)
  }

  protected async performOperation(parameters: ListOrdersUseCaseDTO.Parameters): ListOrdersUseCaseDTO.Result {
    const resultFindAllOrders = await this.ordersRepository.findAll({ customer: parameters.customer })
    if (resultFindAllOrders.isFailure()) return failure(resultFindAllOrders.value)
    return success({ orders: resultFindAllOrders.value.orders })
  }
}

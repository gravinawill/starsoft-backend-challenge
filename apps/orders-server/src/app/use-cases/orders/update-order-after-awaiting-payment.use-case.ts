import { Order, OrderStatus } from '@models/order.model'
import {
  ID,
  type InvalidIDError,
  InvalidOrderStatusError,
  type ISendLogErrorLoggerProvider,
  type ISendLogTimeUseCaseLoggerProvider,
  ModelName,
  OrderNotFoundError,
  type RepositoryError,
  UseCase
} from '@niki/domain'
import { type Either, failure, success } from '@niki/utils'
import { type IUpdateOrderAfterAwaitingPaymentOrdersRepository } from '@repository-contracts/orders/update-order-after-awaiting-payment.orders-repository'
import { type IValidateIDOrdersRepository } from '@repository-contracts/orders/validate-id.orders-repository'

export namespace UpdateOrderAfterAwaitingPaymentUseCaseDTO {
  export type Parameters = Readonly<{ orderAwaitingPayment: { orderID: string } }>

  export type ResultFailure = Readonly<OrderNotFoundError | RepositoryError | InvalidIDError | InvalidOrderStatusError>
  export type ResultSuccess = Readonly<{ message: string }>

  export type Result = Promise<Either<ResultFailure, ResultSuccess>>
}

export class UpdateOrderAfterAwaitingPaymentUseCase extends UseCase<
  UpdateOrderAfterAwaitingPaymentUseCaseDTO.Parameters,
  UpdateOrderAfterAwaitingPaymentUseCaseDTO.ResultFailure,
  UpdateOrderAfterAwaitingPaymentUseCaseDTO.ResultSuccess
> {
  constructor(
    loggerProvider: ISendLogTimeUseCaseLoggerProvider & ISendLogErrorLoggerProvider,
    private readonly ordersRepository: IUpdateOrderAfterAwaitingPaymentOrdersRepository & IValidateIDOrdersRepository
  ) {
    super(loggerProvider)
  }

  protected async performOperation(
    parameters: UpdateOrderAfterAwaitingPaymentUseCaseDTO.Parameters
  ): UpdateOrderAfterAwaitingPaymentUseCaseDTO.Result {
    const resultValidateID = ID.validate({
      id: parameters.orderAwaitingPayment.orderID,
      modelName: ModelName.ORDER
    })
    if (resultValidateID.isFailure()) return failure(resultValidateID.value)
    const { idValidated: orderID } = resultValidateID.value

    const resultValidateIDFromDB = await this.ordersRepository.validateID({ order: { id: orderID } })
    if (resultValidateIDFromDB.isFailure()) return failure(resultValidateIDFromDB.value)
    const { foundOrder } = resultValidateIDFromDB.value

    if (foundOrder === null) return failure(new OrderNotFoundError({ orderID: orderID }))

    if (foundOrder.status !== OrderStatus.INVENTORY_CONFIRMED) {
      this.loggerProvider.sendLogError({
        message: '❌ Order status is not INVENTORY_CONFIRMED',
        value: { order: foundOrder }
      })
      return failure(new InvalidOrderStatusError({ orderStatus: foundOrder.status }))
    }

    const { orderUpdated } = Order.updateAfterAwaitingPayment({ order: { id: foundOrder.id } })

    const resultUpdateOrder = await this.ordersRepository.updateOrderAfterAwaitingPayment({ order: orderUpdated })
    if (resultUpdateOrder.isFailure()) return failure(resultUpdateOrder.value)

    return success({ message: `Order ID (${orderID.value}) updated after awaiting payment successfully` })
  }
}

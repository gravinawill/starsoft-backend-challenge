import type { IUpdateOrderAfterPaymentDoneOrdersRepository } from '@repository-contracts/orders/update-order-after-payment-done.orders-repository'

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
import { type IValidateIDOrdersRepository } from '@repository-contracts/orders/validate-id.orders-repository'

export namespace UpdateOrderAfterPaymentDoneUseCaseDTO {
  export type Parameters = Readonly<{ orderPaymentDone: { orderID: string } }>

  export type ResultFailure = Readonly<OrderNotFoundError | RepositoryError | InvalidIDError | InvalidOrderStatusError>
  export type ResultSuccess = Readonly<{ message: string }>

  export type Result = Promise<Either<ResultFailure, ResultSuccess>>
}

export class UpdateOrderAfterPaymentDoneUseCase extends UseCase<
  UpdateOrderAfterPaymentDoneUseCaseDTO.Parameters,
  UpdateOrderAfterPaymentDoneUseCaseDTO.ResultFailure,
  UpdateOrderAfterPaymentDoneUseCaseDTO.ResultSuccess
> {
  constructor(
    loggerProvider: ISendLogTimeUseCaseLoggerProvider & ISendLogErrorLoggerProvider,
    private readonly ordersRepository: IUpdateOrderAfterPaymentDoneOrdersRepository & IValidateIDOrdersRepository
  ) {
    super(loggerProvider)
  }

  protected async performOperation(
    parameters: UpdateOrderAfterPaymentDoneUseCaseDTO.Parameters
  ): UpdateOrderAfterPaymentDoneUseCaseDTO.Result {
    const { orderPaymentDone } = parameters

    const resultValidateID = ID.validate({
      id: orderPaymentDone.orderID,
      modelName: ModelName.ORDER
    })
    if (resultValidateID.isFailure()) return failure(resultValidateID.value)
    const { idValidated: orderID } = resultValidateID.value

    const resultValidateIDFromDB = await this.ordersRepository.validateID({ order: { id: orderID } })
    if (resultValidateIDFromDB.isFailure()) return failure(resultValidateIDFromDB.value)
    const { foundOrder } = resultValidateIDFromDB.value

    if (foundOrder === null) return failure(new OrderNotFoundError({ orderID }))

    if (foundOrder.status !== OrderStatus.AWAITING_PAYMENT) {
      this.loggerProvider.sendLogError({
        message: '❌ Order status is not AWAITING_PAYMENT',
        value: { order: foundOrder }
      })
      return failure(new InvalidOrderStatusError({ orderStatus: foundOrder.status }))
    }

    const { orderUpdated } = Order.updateAfterPaymentDone({ order: { id: foundOrder.id } })

    const resultUpdateOrder = await this.ordersRepository.updateOrderAfterPaymentDone({ order: orderUpdated })
    if (resultUpdateOrder.isFailure()) return failure(resultUpdateOrder.value)

    return success({ message: `Order ID (${orderID.value}) updated after payment done successfully` })
  }
}

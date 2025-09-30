import { Order, OrderStatus } from '@models/order.model'
import {
  ID,
  type InvalidIDError,
  InvalidOrderStatusError,
  InvalidOrderTotalAmountInCentsError,
  type ISendLogErrorLoggerProvider,
  type ISendLogTimeUseCaseLoggerProvider,
  ModelName,
  OrderNotFoundError,
  type RepositoryError,
  UseCase
} from '@niki/domain'
import { type Either, failure, success } from '@niki/utils'
import { type IUpdateOrderAfterStockAvailableOrdersRepository } from '@repository-contracts/orders/update-order-after-stock-available.orders-repository'
import { type IValidateIDOrdersRepository } from '@repository-contracts/orders/validate-id.orders-repository'

export namespace UpdateOrderAfterStockAvailableUseCaseDTO {
  export type Parameters = Readonly<{
    orderConfirmed: {
      orderID: string
      totalAmountInCents: number
    }
  }>

  export type ResultFailure = Readonly<
    | OrderNotFoundError
    | RepositoryError
    | InvalidIDError
    | InvalidOrderStatusError
    | InvalidOrderTotalAmountInCentsError
  >
  export type ResultSuccess = Readonly<{ message: string }>

  export type Result = Promise<Either<ResultFailure, ResultSuccess>>
}

export class UpdateOrderAfterStockAvailableUseCase extends UseCase<
  UpdateOrderAfterStockAvailableUseCaseDTO.Parameters,
  UpdateOrderAfterStockAvailableUseCaseDTO.ResultFailure,
  UpdateOrderAfterStockAvailableUseCaseDTO.ResultSuccess
> {
  constructor(
    loggerProvider: ISendLogTimeUseCaseLoggerProvider & ISendLogErrorLoggerProvider,
    private readonly ordersRepository: IUpdateOrderAfterStockAvailableOrdersRepository & IValidateIDOrdersRepository
  ) {
    super(loggerProvider)
  }

  protected async performOperation(
    parameters: UpdateOrderAfterStockAvailableUseCaseDTO.Parameters
  ): UpdateOrderAfterStockAvailableUseCaseDTO.Result {
    const resultValidateID = ID.validate({
      id: parameters.orderConfirmed.orderID,
      modelName: ModelName.ORDER
    })
    if (resultValidateID.isFailure()) return failure(resultValidateID.value)
    const { idValidated: orderID } = resultValidateID.value

    const resultValidateIDFromDB = await this.ordersRepository.validateID({ order: { id: orderID } })
    if (resultValidateIDFromDB.isFailure()) return failure(resultValidateIDFromDB.value)
    const { foundOrder } = resultValidateIDFromDB.value

    if (foundOrder === null) return failure(new OrderNotFoundError({ orderID: orderID }))

    if (foundOrder.status !== OrderStatus.CREATED) {
      this.loggerProvider.sendLogError({
        message: '❌ Order status is not CREATED',
        value: { order: foundOrder }
      })
      return failure(new InvalidOrderStatusError({ orderStatus: foundOrder.status }))
    }

    if (foundOrder.totalAmountInCents !== null) {
      this.loggerProvider.sendLogError({
        message: '❌ Order total amount in cents is not null',
        value: { order: foundOrder }
      })
      return failure(
        new InvalidOrderTotalAmountInCentsError({ orderTotalAmountInCents: foundOrder.totalAmountInCents })
      )
    }

    const { orderUpdated } = Order.updateAfterStockAvailable({
      order: { id: foundOrder.id, totalAmountInCents: parameters.orderConfirmed.totalAmountInCents }
    })

    const resultUpdateOrder = await this.ordersRepository.updateOrderAfterStockAvailable({ order: orderUpdated })
    if (resultUpdateOrder.isFailure()) return failure(resultUpdateOrder.value)
    return success({ message: 'Order updated after stock available' })
  }
}

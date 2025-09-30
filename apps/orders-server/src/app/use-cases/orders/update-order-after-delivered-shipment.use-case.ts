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
import { type IUpdateOrderAfterDeliveryCompletedOrdersRepository } from '@repository-contracts/orders/update-order-after-delivery-completed.orders-repository'
import { type IValidateIDOrdersRepository } from '@repository-contracts/orders/validate-id.orders-repository'

export namespace UpdateOrderAfterDeliveredShipmentUseCaseDTO {
  export type Parameters = Readonly<{
    orderDelivered: { orderID: string }
  }>

  export type ResultFailure = Readonly<OrderNotFoundError | RepositoryError | InvalidIDError | InvalidOrderStatusError>
  export type ResultSuccess = Readonly<{ message: string }>

  export type Result = Promise<Either<ResultFailure, ResultSuccess>>
}

export class UpdateOrderAfterDeliveredShipmentUseCase extends UseCase<
  UpdateOrderAfterDeliveredShipmentUseCaseDTO.Parameters,
  UpdateOrderAfterDeliveredShipmentUseCaseDTO.ResultFailure,
  UpdateOrderAfterDeliveredShipmentUseCaseDTO.ResultSuccess
> {
  constructor(
    loggerProvider: ISendLogTimeUseCaseLoggerProvider & ISendLogErrorLoggerProvider,
    private readonly ordersRepository: IUpdateOrderAfterDeliveryCompletedOrdersRepository & IValidateIDOrdersRepository
  ) {
    super(loggerProvider)
  }

  protected async performOperation(
    parameters: UpdateOrderAfterDeliveredShipmentUseCaseDTO.Parameters
  ): UpdateOrderAfterDeliveredShipmentUseCaseDTO.Result {
    const { orderDelivered } = parameters

    const resultValidateID = ID.validate({
      id: orderDelivered.orderID,
      modelName: ModelName.ORDER
    })
    if (resultValidateID.isFailure()) return failure(resultValidateID.value)
    const { idValidated: orderID } = resultValidateID.value

    const resultValidateIDFromDB = await this.ordersRepository.validateID({ order: { id: orderID } })
    if (resultValidateIDFromDB.isFailure()) return failure(resultValidateIDFromDB.value)
    const { foundOrder } = resultValidateIDFromDB.value

    if (foundOrder === null) return failure(new OrderNotFoundError({ orderID }))

    if (foundOrder.status !== OrderStatus.SHIPMENT_CREATED) {
      this.loggerProvider.sendLogError({
        message: '❌ Order status is not SHIPMENT_CREATED',
        value: { order: foundOrder }
      })
      return failure(new InvalidOrderStatusError({ orderStatus: foundOrder.status }))
    }

    const { orderUpdated } = Order.updateAfterDeliveryCompleted({ order: { id: foundOrder.id } })

    const resultUpdateOrder = await this.ordersRepository.updateOrderAfterDeliveryCompleted({ order: orderUpdated })
    if (resultUpdateOrder.isFailure()) return failure(resultUpdateOrder.value)

    return success({ message: `Order ID (${orderID.value}) updated after delivery completed successfully` })
  }
}

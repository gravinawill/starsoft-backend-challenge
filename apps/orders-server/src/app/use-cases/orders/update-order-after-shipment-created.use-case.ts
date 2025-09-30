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
import { type IUpdateOrderAfterShipmentCreatedOrdersRepository } from '@repository-contracts/orders/update-order-after-shipment-created.orders-repository'
import { type IValidateIDOrdersRepository } from '@repository-contracts/orders/validate-id.orders-repository'

export namespace UpdateOrderAfterShipmentCreatedUseCaseDTO {
  export type Parameters = Readonly<{
    orderShipmentCreated: { orderID: string }
  }>

  export type ResultFailure = Readonly<OrderNotFoundError | RepositoryError | InvalidIDError | InvalidOrderStatusError>
  export type ResultSuccess = Readonly<{ message: string }>

  export type Result = Promise<Either<ResultFailure, ResultSuccess>>
}

export class UpdateOrderAfterShipmentCreatedUseCase extends UseCase<
  UpdateOrderAfterShipmentCreatedUseCaseDTO.Parameters,
  UpdateOrderAfterShipmentCreatedUseCaseDTO.ResultFailure,
  UpdateOrderAfterShipmentCreatedUseCaseDTO.ResultSuccess
> {
  constructor(
    loggerProvider: ISendLogTimeUseCaseLoggerProvider & ISendLogErrorLoggerProvider,
    private readonly ordersRepository: IUpdateOrderAfterShipmentCreatedOrdersRepository & IValidateIDOrdersRepository
  ) {
    super(loggerProvider)
  }

  protected async performOperation(
    parameters: UpdateOrderAfterShipmentCreatedUseCaseDTO.Parameters
  ): UpdateOrderAfterShipmentCreatedUseCaseDTO.Result {
    const { orderShipmentCreated } = parameters

    const resultValidateID = ID.validate({
      id: orderShipmentCreated.orderID,
      modelName: ModelName.ORDER
    })
    if (resultValidateID.isFailure()) return failure(resultValidateID.value)
    const { idValidated: orderID } = resultValidateID.value

    const resultValidateIDFromDB = await this.ordersRepository.validateID({ order: { id: orderID } })
    if (resultValidateIDFromDB.isFailure()) return failure(resultValidateIDFromDB.value)
    const { foundOrder } = resultValidateIDFromDB.value

    if (foundOrder === null) return failure(new OrderNotFoundError({ orderID }))

    if (foundOrder.status !== OrderStatus.PAYMENT_SUCCEEDED) {
      this.loggerProvider.sendLogError({
        message: '❌ Order status is not PAYMENT_SUCCEEDED',
        value: { order: foundOrder }
      })
      return failure(new InvalidOrderStatusError({ orderStatus: foundOrder.status }))
    }

    const { orderUpdated } = Order.updateAfterShipmentCreated({ order: { id: foundOrder.id } })

    const resultUpdateOrder = await this.ordersRepository.updateOrderAfterShipmentCreated({ order: orderUpdated })
    if (resultUpdateOrder.isFailure()) return failure(resultUpdateOrder.value)

    return success({ message: `Order ID (${orderID.value}) updated after shipment created successfully` })
  }
}

import { Order } from '@models/order.model'
import {
  type GenerateIDError,
  ID,
  type InvalidIDError,
  type InvalidOrderPaymentMethodError,
  type InvalidOrderStatusError,
  type ISendLogErrorLoggerProvider,
  type ISendLogTimeUseCaseLoggerProvider,
  ModelName,
  OrderAlreadyExistsError,
  type OrdersStockAvailableEventPayload,
  type ProductsNotFoundError,
  type RepositoryError,
  UseCase
} from '@niki/domain'
import { type Either, failure, success } from '@niki/utils'
import { type IValidateIDCustomersRepository } from '@repository-contracts/customers/validate-id.customers-repository'
import { type ISaveOrdersRepository } from '@repository-contracts/orders/save.orders-repository'
import { type IValidateIDOrdersRepository } from '@repository-contracts/orders/validate-id.orders-repository'

export namespace CreateOrderByEventUseCaseDTO {
  export type Parameters = Readonly<{ payload: OrdersStockAvailableEventPayload }>

  export type ResultFailure = Readonly<
    | InvalidIDError
    | RepositoryError
    | ProductsNotFoundError
    | GenerateIDError
    | InvalidOrderStatusError
    | OrderAlreadyExistsError
    | InvalidOrderPaymentMethodError
  >
  export type ResultSuccess = Readonly<{
    orderCreated: Order
    message: string
  }>

  export type Result = Promise<Either<ResultFailure, ResultSuccess>>
}

export class CreateOrderByEventUseCase extends UseCase<
  CreateOrderByEventUseCaseDTO.Parameters,
  CreateOrderByEventUseCaseDTO.ResultFailure,
  CreateOrderByEventUseCaseDTO.ResultSuccess
> {
  constructor(
    loggerProvider: ISendLogTimeUseCaseLoggerProvider & ISendLogErrorLoggerProvider,
    private readonly ordersRepository: ISaveOrdersRepository & IValidateIDOrdersRepository,
    private readonly customersRepository: IValidateIDCustomersRepository
  ) {
    super(loggerProvider)
  }

  protected async performOperation(
    parameters: CreateOrderByEventUseCaseDTO.Parameters
  ): CreateOrderByEventUseCaseDTO.Result {
    const resultValidateCustomerID = ID.validate({ id: parameters.payload.customerID, modelName: ModelName.USER })
    if (resultValidateCustomerID.isFailure()) return failure(resultValidateCustomerID.value)
    const { idValidated: customerID } = resultValidateCustomerID.value

    const resultValidateOrderID = ID.validate({ id: parameters.payload.orderID, modelName: ModelName.ORDER })
    if (resultValidateOrderID.isFailure()) return failure(resultValidateOrderID.value)
    const { idValidated: orderID } = resultValidateOrderID.value

    const resultValidateIDCustomerFromDB = await this.customersRepository.validateID({ customer: { id: customerID } })
    if (resultValidateIDCustomerFromDB.isFailure()) return failure(resultValidateIDCustomerFromDB.value)
    const { foundCustomer } = resultValidateIDCustomerFromDB.value
    if (foundCustomer !== null) return failure(new OrderAlreadyExistsError({ orderID: orderID }))

    const resultValidateIDOrderFromDB = await this.ordersRepository.validateID({ order: { id: orderID } })
    if (resultValidateIDOrderFromDB.isFailure()) return failure(resultValidateIDOrderFromDB.value)
    const { foundOrder } = resultValidateIDOrderFromDB.value
    if (foundOrder !== null) return failure(new OrderAlreadyExistsError({ orderID: orderID }))

    const { orderCreated } = Order.create({
      orderID,
      createdAt: parameters.payload.createdAt,
      updatedAt: parameters.payload.updatedAt,
      customer: { id: customerID }
    })

    const resultSaveOrder = await this.ordersRepository.save({ order: orderCreated })
    if (resultSaveOrder.isFailure()) return failure(resultSaveOrder.value)

    return success({ orderCreated, message: 'Order created successfully with ID: ' + orderCreated.id.value })
  }
}

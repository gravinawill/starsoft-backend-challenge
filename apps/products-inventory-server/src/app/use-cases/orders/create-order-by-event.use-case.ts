import { Order, type OrderProductReservation } from '@models/order.model'
import { type Product } from '@models/product.model'
import {
  type GenerateIDError,
  ID,
  type InvalidIDError,
  type ISendLogErrorLoggerProvider,
  type ISendLogTimeUseCaseLoggerProvider,
  ModelName,
  OrderAlreadyExistsError,
  type OrdersOrderCreatedEventPayload,
  ProductsNotFoundError,
  type RepositoryError,
  UseCase
} from '@niki/domain'
import { type Either, failure, success } from '@niki/utils'
import { type ISaveOrdersRepository } from '@repository-contracts/orders/save.orders-repository'
import { type IValidateIDOrdersRepository } from '@repository-contracts/orders/validate-id.orders-repository'
import { type IValidateIDsProductsRepository } from '@repository-contracts/products/validate-ids.products-repository'

export namespace CreateOrderByEventUseCaseDTO {
  export type Parameters = Readonly<{ payload: OrdersOrderCreatedEventPayload }>

  export type ResultFailure = Readonly<
    InvalidIDError | RepositoryError | ProductsNotFoundError | GenerateIDError | OrderAlreadyExistsError
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
    private readonly productsRepository: IValidateIDsProductsRepository
  ) {
    super(loggerProvider)
  }

  protected async performOperation(
    parameters: CreateOrderByEventUseCaseDTO.Parameters
  ): CreateOrderByEventUseCaseDTO.Result {
    const resultValidateID = ID.validate({ id: parameters.payload.orderID, modelName: ModelName.ORDER })
    if (resultValidateID.isFailure()) return failure(resultValidateID.value)
    const { idValidated: orderID } = resultValidateID.value

    const resultValidateIDOrder = await this.ordersRepository.validateID({ order: { id: orderID } })
    if (resultValidateIDOrder.isFailure()) return failure(resultValidateIDOrder.value)
    const { foundOrder } = resultValidateIDOrder.value
    if (foundOrder !== null) return failure(new OrderAlreadyExistsError({ orderID: orderID }))

    const productInvalidIDs: InvalidIDError[] = []
    const validatedProductIDs: Array<Pick<Product, 'id'>> = []
    for (const { id } of parameters.payload.products) {
      const result = ID.validate({ id, modelName: ModelName.PRODUCT })
      if (result.isFailure()) {
        productInvalidIDs.push(result.value)
      } else {
        validatedProductIDs.push({ id: result.value.idValidated })
      }
    }
    if (productInvalidIDs.length > 0) return failure(productInvalidIDs[0]!)

    const resultValidateIDsProducts = await this.productsRepository.validateIDs({ products: validatedProductIDs })
    if (resultValidateIDsProducts.isFailure()) return failure(resultValidateIDsProducts.value)

    const { foundProducts, notFoundProducts } = resultValidateIDsProducts.value
    if (foundProducts.length !== parameters.payload.products.length || notFoundProducts.length > 0) {
      return failure(new ProductsNotFoundError({ productIDs: notFoundProducts.map((product) => product.id) }))
    }

    const quantityMap = new Map(parameters.payload.products.map((p) => [p.id, p.quantity]))

    const productsReserved: Array<Pick<OrderProductReservation, 'product' | 'quantity' | 'pricePerUnitInCents'>> =
      foundProducts.map((product) => ({
        product: { id: product.id },
        quantity: quantityMap.get(product.id.value)!,
        pricePerUnitInCents: product.priceInCents
      }))

    const order = Order.create({
      orderID,
      createdAt: parameters.payload.createdAt,
      updatedAt: parameters.payload.updatedAt,
      orderProductReservation: productsReserved
    })
    if (order.isFailure()) return failure(order.value)
    const { orderCreated } = order.value

    const resultSaveOrder = await this.ordersRepository.save({ order: orderCreated })
    if (resultSaveOrder.isFailure()) return failure(resultSaveOrder.value)

    return success({ orderCreated, message: 'Order created successfully with ID: ' + orderCreated.id.value })
  }
}

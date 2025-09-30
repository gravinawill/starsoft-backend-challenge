import { type Customer } from '@models/customer.model'
import { Order, type PaymentMethod } from '@models/order.model'
import {
  type GenerateIDError,
  ID,
  type InvalidIDError,
  type ISendLogErrorLoggerProvider,
  type ISendLogTimeUseCaseLoggerProvider,
  ModelName,
  OrderDuplicatedProductsError,
  type ProductNotFoundError,
  ProductsNotFoundError,
  type RepositoryError,
  UseCase
} from '@niki/domain'
import { type Either, failure, success } from '@niki/utils'
import { type ISaveOrdersRepository } from '@repository-contracts/orders/save.orders-repository'
import { type ISaveProductsRepository } from '@repository-contracts/products/save.products-repository'
import { type IValidateIDsProductsRepository } from '@repository-contracts/products/validate-ids.products-repository'

export namespace CreateOrderUseCaseDTO {
  export type Parameters = Readonly<{
    customer: Pick<Customer, 'id'>
    order: { products: Array<{ id: string; quantity: number }>; paymentMethod: PaymentMethod }
  }>

  export type ResultFailure = Readonly<
    | RepositoryError
    | GenerateIDError
    | ProductsNotFoundError
    | InvalidIDError
    | ProductNotFoundError
    | OrderDuplicatedProductsError
  >
  export type ResultSuccess = Readonly<{ orderCreated: Order }>

  export type Result = Promise<Either<ResultFailure, ResultSuccess>>
}

export class CreateOrderUseCase extends UseCase<
  CreateOrderUseCaseDTO.Parameters,
  CreateOrderUseCaseDTO.ResultFailure,
  CreateOrderUseCaseDTO.ResultSuccess
> {
  constructor(
    loggerProvider: ISendLogTimeUseCaseLoggerProvider & ISendLogErrorLoggerProvider,
    private readonly productsRepository: ISaveProductsRepository & IValidateIDsProductsRepository,
    private readonly ordersRepository: ISaveOrdersRepository
  ) {
    super(loggerProvider)
  }

  protected async performOperation(parameters: CreateOrderUseCaseDTO.Parameters): CreateOrderUseCaseDTO.Result {
    const duplicatedIDs = [
      ...new Set(parameters.order.products.map((p) => p.id).filter((id, idx, arr) => arr.indexOf(id) !== idx))
    ]
    if (duplicatedIDs.length > 0) {
      return failure(new OrderDuplicatedProductsError({ duplicatedProductIDs: duplicatedIDs }))
    }

    const validatedProductIDs: ID[] = []
    for (const { id } of parameters.order.products) {
      const result = ID.validate({ id, modelName: ModelName.PRODUCT })
      if (result.isFailure()) return failure(result.value)
      validatedProductIDs.push(result.value.idValidated)
    }

    const resultValidateIDFromDB = await this.productsRepository.validateIDs({
      products: validatedProductIDs.map((productID) => ({ id: productID }))
    })
    if (resultValidateIDFromDB.isFailure()) return failure(resultValidateIDFromDB.value)
    const { foundProducts, notFoundProducts } = resultValidateIDFromDB.value
    if (foundProducts.length !== validatedProductIDs.length && notFoundProducts.length > 0) {
      return failure(new ProductsNotFoundError({ productIDs: notFoundProducts.map((product) => product.id) }))
    }

    const products = foundProducts
      .map((product) => {
        const matchedProduct = parameters.order.products.find((p) => p.id === product.id.value)
        if (!matchedProduct) return null
        return {
          product: { id: product.id },
          quantity: matchedProduct.quantity
        }
      })
      .filter((product) => product !== null)

    console.log('products', products)

    const resultCreateOrder = Order.create({
      customer: parameters.customer,
      paymentMethod: parameters.order.paymentMethod,
      products
    })
    if (resultCreateOrder.isFailure()) return failure(resultCreateOrder.value)
    const { orderCreated } = resultCreateOrder.value
    const resultSaveOrder = await this.ordersRepository.save({ order: orderCreated })
    if (resultSaveOrder.isFailure()) return failure(resultSaveOrder.value)
    return success({ orderCreated })
  }
}

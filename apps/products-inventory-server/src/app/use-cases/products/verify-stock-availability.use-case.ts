import { type Order } from '@models/order.model'
import {
  type ID,
  type InvalidIDError,
  type ISendLogErrorLoggerProvider,
  type ISendLogTimeUseCaseLoggerProvider,
  ProductsNotEnoughStockError,
  ProductsNotFoundError,
  type RepositoryError,
  UseCase
} from '@niki/domain'
import { type Either, failure, success } from '@niki/utils'
import { type IUpdateOrderProductsReservationRepository } from '@repository-contracts/orders/update-order-products-reservation.orders-repository'
import { type IFindAndUpdateAvailabilityProductsRepository } from '@repository-contracts/products/find-and-update-availability.products-repository'

export namespace VerifyStockAvailabilityUseCaseDTO {
  export type Parameters = Readonly<{ order: Order }>

  export type ResultFailure = Readonly<
    RepositoryError | InvalidIDError | ProductsNotFoundError | ProductsNotEnoughStockError
  >
  export type ResultSuccess = Readonly<{
    orderConfirmed: Pick<Order, 'id' | 'orderProductReservation' | 'createdAt' | 'updatedAt'>
    message: string
  }>

  export type Result = Promise<Either<ResultFailure, ResultSuccess>>
}

export class VerifyStockAvailabilityUseCase extends UseCase<
  VerifyStockAvailabilityUseCaseDTO.Parameters,
  VerifyStockAvailabilityUseCaseDTO.ResultFailure,
  VerifyStockAvailabilityUseCaseDTO.ResultSuccess
> {
  constructor(
    loggerProvider: ISendLogTimeUseCaseLoggerProvider & ISendLogErrorLoggerProvider,
    private readonly productsRepository: IFindAndUpdateAvailabilityProductsRepository,
    private readonly ordersRepository: IUpdateOrderProductsReservationRepository
  ) {
    super(loggerProvider)
  }

  protected async performOperation(
    parameters: VerifyStockAvailabilityUseCaseDTO.Parameters
  ): VerifyStockAvailabilityUseCaseDTO.Result {
    const resultFindAndUpdate = await this.productsRepository.findAndUpdateAvailability({
      productsToFind: parameters.order.orderProductReservation.map((orderProductReservation) => ({
        id: orderProductReservation.product.id
      })),

      executeWithinTransaction: (products) => {
        const productNotFoundErrors: ID[] = []
        const productNotEnoughStockErrors: ID[] = []

        for (const orderProductReservation of parameters.order.orderProductReservation) {
          const productAvailability = products.find((p) => p.id.equals({ otherID: orderProductReservation.product.id }))

          if (productAvailability === undefined) {
            productNotFoundErrors.push(orderProductReservation.product.id)
          } else if (productAvailability.availableCount < orderProductReservation.quantity) {
            productNotEnoughStockErrors.push(orderProductReservation.product.id)
          }
        }

        if (productNotFoundErrors.length > 0) {
          return failure(new ProductsNotFoundError({ productIDs: productNotFoundErrors }))
        }

        if (productNotEnoughStockErrors.length > 0) {
          return failure(new ProductsNotEnoughStockError({ productIDs: productNotEnoughStockErrors }))
        }

        const now = new Date()
        const productsToUpdate = products.map((product) => {
          const orderProductReservation = parameters.order.orderProductReservation.find((opr) =>
            opr.product.id.equals({ otherID: product.id })
          )!

          return {
            id: product.id,
            availableCount: product.availableCount - orderProductReservation.quantity,
            unavailableCount: product.unavailableCount + orderProductReservation.quantity,
            updatedAt: now
          }
        })

        return success({ productsToUpdate })
      }
    })

    if (resultFindAndUpdate.isFailure()) return failure(resultFindAndUpdate.value)

    parameters.order.addExpiresAtToOrderProductReservation()
    parameters.order.confirmOrderProductReservation()

    const resultUpdateOrder = await this.ordersRepository.updateOrderProductsReservation({
      order: {
        id: parameters.order.id,
        orderProductReservation: parameters.order.orderProductReservation,
        updatedAt: parameters.order.updatedAt
      }
    })

    if (resultUpdateOrder.isFailure()) return failure(resultUpdateOrder.value)

    return success({
      orderConfirmed: parameters.order,
      message: 'Stock availability verified successfully with ID: ' + parameters.order.id.value
    })
  }
}

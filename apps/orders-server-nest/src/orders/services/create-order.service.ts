import { Injectable } from '@nestjs/common'
import { AppLogger } from '@shared/logger/logger.service'
import { Either, failure, success } from '@utils/either.util'

import { ProductsRepository } from '@/products/infra/products.repository'

import { OrderStatus, PaymentMethod } from '../entities/order.entity'
import { OrderRepository } from '../infra/orders.repository'

type ProductInput = {
  id: string
  quantity: number
}

type CreateOrderParams = {
  order: { customerID: string; products: ProductInput[]; paymentMethod: PaymentMethod }
}

type OrderError = {
  message: string
}

type OrderSuccess = {
  orderCreated: { id: string }
}

@Injectable()
export class CreateOrderService {
  constructor(
    private readonly repository: OrderRepository,
    private readonly logger: AppLogger,
    private readonly productsRepository: ProductsRepository
  ) {
    this.logger.setContext(CreateOrderService.name)
  }

  public async createOrder(parameters: CreateOrderParams): Promise<Either<OrderError, OrderSuccess>> {
    try {
      const validationError = this.validateOrderProducts({ products: parameters.order.products })
      if (validationError.isFailure()) return failure({ message: validationError.value.message })

      const productsValidation = await this.validateProductsExistence({ products: parameters.order.products })
      if (productsValidation.isFailure()) return failure({ message: productsValidation.value.message })

      const resultSaveOrder = await this.repository.saveOrder({
        order: {
          customerID: parameters.order.customerID,
          paymentMethod: parameters.order.paymentMethod,
          totalAmountInCents: null,
          status: OrderStatus.CREATED
        }
      })

      if (resultSaveOrder.isFailure()) return failure({ message: resultSaveOrder.value.message })

      return success({ orderCreated: { id: resultSaveOrder.value.orderSaved.id } })
    } catch (error) {
      this.logger.error({
        message: 'Failed to create order',
        meta: {
          error,
          customerID: parameters.order.customerID,
          productCount: parameters.order.products.length
        }
      })
      return failure({ message: 'An unexpected error occurred while creating the order.' })
    }
  }

  private validateOrderProducts(parameters: { products: ProductInput[] }): Either<OrderError, null> {
    if (parameters.products.length === 0) return failure({ message: 'Order must contain at least one product.' })
    if (parameters.products.some((product) => product.quantity <= 0)) {
      return failure({ message: 'Product quantity must be greater than 0.' })
    }
    const productIDs = parameters.products.map((product) => product.id)
    const uniqueProductIds = new Set(productIDs)
    if (uniqueProductIds.size !== productIDs.length) return failure({ message: 'Order contains duplicated products.' })
    return success(null)
  }

  private async validateProductsExistence(parameters: { products: ProductInput[] }): Promise<Either<OrderError, null>> {
    const productIds = parameters.products.map((product) => product.id)
    const resultFindManyProducts = await this.productsRepository.findManyProducts(productIds)
    if (resultFindManyProducts.isFailure()) return failure({ message: resultFindManyProducts.value.message })
    const { foundProducts } = resultFindManyProducts.value
    if (foundProducts.length !== parameters.products.length) {
      return failure({ message: 'Invalid product data in order.' })
    }
    return success(null)
  }
}

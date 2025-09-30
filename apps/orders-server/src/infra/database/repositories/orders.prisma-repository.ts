import type {
  IUpdateOrderAfterDeliveryCompletedOrdersRepository,
  UpdateOrderAfterDeliveryCompletedOrdersRepositoryDTO
} from '@repository-contracts/orders/update-order-after-delivery-completed.orders-repository'
import type {
  IUpdateOrderAfterPaymentDoneOrdersRepository,
  UpdateOrderAfterPaymentDoneOrdersRepositoryDTO
} from '@repository-contracts/orders/update-order-after-payment-done.orders-repository'
import type {
  IUpdateOrderAfterShipmentCreatedOrdersRepository,
  UpdateOrderAfterShipmentCreatedOrdersRepositoryDTO
} from '@repository-contracts/orders/update-order-after-shipment-created.orders-repository'

import { Order } from '@models/order.model'
import { ID, type ILoggerProvider, ModelName, RepositoryError } from '@niki/domain'
import { failure, success } from '@niki/utils'
import {
  type ISaveOrdersRepository,
  type SaveOrdersRepositoryDTO
} from '@repository-contracts/orders/save.orders-repository'
import {
  type IUpdateOrderAfterAwaitingPaymentOrdersRepository,
  type UpdateOrderAfterAwaitingPaymentOrdersRepositoryDTO
} from '@repository-contracts/orders/update-order-after-awaiting-payment.orders-repository'
import {
  type IUpdateOrderAfterStockAvailableOrdersRepository,
  type UpdateOrderAfterStockAvailableOrdersRepositoryDTO
} from '@repository-contracts/orders/update-order-after-stock-available.orders-repository'
import {
  type IValidateIDOrdersRepository,
  type ValidateIDOrdersRepositoryDTO
} from '@repository-contracts/orders/validate-id.orders-repository'

import { type Database } from '../database'

export class OrdersPrismaRepository
  implements
    ISaveOrdersRepository,
    IUpdateOrderAfterStockAvailableOrdersRepository,
    IValidateIDOrdersRepository,
    IUpdateOrderAfterAwaitingPaymentOrdersRepository,
    IUpdateOrderAfterPaymentDoneOrdersRepository,
    IUpdateOrderAfterDeliveryCompletedOrdersRepository,
    IUpdateOrderAfterShipmentCreatedOrdersRepository
{
  constructor(
    private readonly logger: ILoggerProvider,
    private readonly database: Database
  ) {}

  public async updateOrderAfterPaymentDone(
    parameters: UpdateOrderAfterPaymentDoneOrdersRepositoryDTO.Parameters
  ): UpdateOrderAfterPaymentDoneOrdersRepositoryDTO.Result {
    try {
      await this.database.prisma.order.update({
        where: { id: parameters.order.id.value },
        data: {
          status: parameters.order.status,
          updatedAt: parameters.order.updatedAt
        }
      })
      return success(null)
    } catch (error: unknown) {
      const repositoryError = new RepositoryError({
        error,
        repository: { method: 'update order after payment done', name: 'orders', externalName: 'prisma' }
      })
      this.logger.sendLogError({ message: repositoryError.errorMessage, value: repositoryError })
      return failure(repositoryError)
    }
  }

  public async validateID(parameters: ValidateIDOrdersRepositoryDTO.Parameters): ValidateIDOrdersRepositoryDTO.Result {
    try {
      const found = await this.database.prisma.order.findUnique({
        where: {
          id: parameters.order.id.value
        },
        select: { id: true, status: true, totalAmountInCents: true, updatedAt: true }
      })
      if (found === null) return success({ foundOrder: null })

      const resultValidateID = ID.validate({ id: found.id, modelName: ModelName.ORDER })
      if (resultValidateID.isFailure()) return failure(resultValidateID.value)
      const { idValidated: orderID } = resultValidateID.value

      const resultValidateStatus = Order.validateStatus({ status: found.status })
      if (resultValidateStatus.isFailure()) return failure(resultValidateStatus.value)
      const { statusValidated: orderStatus } = resultValidateStatus.value

      return success({
        foundOrder: {
          id: orderID,
          status: orderStatus,
          totalAmountInCents: found.totalAmountInCents
        }
      })
    } catch (error: unknown) {
      const repositoryError = new RepositoryError({
        error,
        repository: { method: 'validate id', name: 'orders', externalName: 'prisma' }
      })
      this.logger.sendLogError({ message: repositoryError.errorMessage, value: repositoryError })
      return failure(repositoryError)
    }
  }

  public async updateOrderAfterStockAvailable(
    parameters: UpdateOrderAfterStockAvailableOrdersRepositoryDTO.Parameters
  ): UpdateOrderAfterStockAvailableOrdersRepositoryDTO.Result {
    try {
      await this.database.prisma.order.update({
        where: { id: parameters.order.id.value },
        data: {
          status: parameters.order.status,
          updatedAt: parameters.order.updatedAt,
          totalAmountInCents: parameters.order.totalAmountInCents
        }
      })
      return success(null)
    } catch (error: unknown) {
      const repositoryError = new RepositoryError({
        error,
        repository: { method: 'update order after stock available', name: 'orders', externalName: 'prisma' }
      })
      this.logger.sendLogError({ message: repositoryError.errorMessage, value: repositoryError })
      return failure(repositoryError)
    }
  }

  public async updateOrderAfterAwaitingPayment(
    parameters: UpdateOrderAfterAwaitingPaymentOrdersRepositoryDTO.Parameters
  ): UpdateOrderAfterAwaitingPaymentOrdersRepositoryDTO.Result {
    try {
      await this.database.prisma.order.update({
        where: { id: parameters.order.id.value },
        data: {
          status: parameters.order.status,
          updatedAt: parameters.order.updatedAt
        }
      })
      return success(null)
    } catch (error: unknown) {
      const repositoryError = new RepositoryError({
        error,
        repository: { method: 'update order after awaiting payment', name: 'orders', externalName: 'prisma' }
      })
      this.logger.sendLogError({ message: repositoryError.errorMessage, value: repositoryError })
      return failure(repositoryError)
    }
  }

  public async updateOrderAfterDeliveryCompleted(
    parameters: UpdateOrderAfterDeliveryCompletedOrdersRepositoryDTO.Parameters
  ): UpdateOrderAfterDeliveryCompletedOrdersRepositoryDTO.Result {
    try {
      await this.database.prisma.order.update({
        where: { id: parameters.order.id.value },
        data: {
          status: parameters.order.status,
          updatedAt: parameters.order.updatedAt
        }
      })
      return success(null)
    } catch (error: unknown) {
      const repositoryError = new RepositoryError({
        error,
        repository: { method: 'update order after delivery completed', name: 'orders', externalName: 'prisma' }
      })
      this.logger.sendLogError({ message: repositoryError.errorMessage, value: repositoryError })
      return failure(repositoryError)
    }
  }

  public async updateOrderAfterShipmentCreated(
    parameters: UpdateOrderAfterShipmentCreatedOrdersRepositoryDTO.Parameters
  ): UpdateOrderAfterShipmentCreatedOrdersRepositoryDTO.Result {
    try {
      await this.database.prisma.order.update({
        where: { id: parameters.order.id.value },
        data: {
          status: parameters.order.status,
          updatedAt: parameters.order.updatedAt
        }
      })
      return success(null)
    } catch (error: unknown) {
      const repositoryError = new RepositoryError({
        error,
        repository: { method: 'update order after shipment created', name: 'orders', externalName: 'prisma' }
      })
      this.logger.sendLogError({ message: repositoryError.errorMessage, value: repositoryError })
      return failure(repositoryError)
    }
  }

  public async save(parameters: SaveOrdersRepositoryDTO.Parameters): SaveOrdersRepositoryDTO.Result {
    try {
      await this.database.prisma.order.create({
        data: {
          createdAt: parameters.order.createdAt,
          updatedAt: parameters.order.updatedAt,
          deletedAt: parameters.order.deletedAt,
          id: parameters.order.id.value,
          status: parameters.order.status,
          paymentMethod: parameters.order.paymentMethod,
          totalAmountInCents: parameters.order.totalAmountInCents
        },
        select: { id: true }
      })
      return success(null)
    } catch (error: unknown) {
      const repositoryError = new RepositoryError({
        error,
        repository: { method: 'save', name: 'orders', externalName: 'prisma' }
      })
      this.logger.sendLogError({ message: repositoryError.errorMessage, value: repositoryError })
      return failure(repositoryError)
    }
  }
}

import { Billing, type BillingStatus, type PaymentGateway } from '@models/billing.model'
import { Order, type OrderStatus, type PaymentMethod } from '@models/order.model'
import { ID, type ILoggerProvider, ModelName, RepositoryError } from '@niki/domain'
import { failure, success } from '@niki/utils'
import {
  type FindBillingByExternalIDBillingsRepositoryDTO,
  type IFindBillingByExternalIDBillingsRepository
} from '@repository-contracts/billings/find-billing-by-external-id.billings-repository'
import {
  type FindBillingByOrderBillingsRepositoryDTO,
  type IFindBillingByOrderBillingsRepository
} from '@repository-contracts/billings/find-billing-by-order.billings-repository'
import {
  type ISaveAndUpdateOrderBillingsRepository,
  type SaveAndUpdateOrderBillingsRepositoryDTO
} from '@repository-contracts/billings/save-and-update-order.billings-repository'
import {
  type IUpdateStatusAndUpdateOrderBillingsRepository,
  type UpdateStatusAndUpdateOrderBillingsRepositoryDTO
} from '@repository-contracts/billings/update-status-and-update-order.billings-repository'

import { type Database } from '../database'

export class BillingsPrismaRepository
  implements
    IFindBillingByOrderBillingsRepository,
    ISaveAndUpdateOrderBillingsRepository,
    IFindBillingByExternalIDBillingsRepository,
    IUpdateStatusAndUpdateOrderBillingsRepository
{
  constructor(
    private readonly logger: ILoggerProvider,
    private readonly database: Database
  ) {}

  private handleRepositoryError(error: unknown, method: string): RepositoryError {
    const errorInstance = error instanceof Error ? error : new Error(String(error))
    return new RepositoryError({
      error: errorInstance,
      repository: { method, name: 'billings', externalName: 'prisma' }
    })
  }

  public async findByExternalID(
    parameters: FindBillingByExternalIDBillingsRepositoryDTO.Parameters
  ): FindBillingByExternalIDBillingsRepositoryDTO.Result {
    try {
      const found = await this.database.prisma.billing.findFirst({
        where: {
          paymentGatewayBillingID: parameters.billing.paymentGatewayBillingID,
          deletedAt: null
        },
        select: {
          id: true,
          status: true,
          paymentURL: true,
          amountInCents: true,
          paymentMethod: true,
          paymentGateway: true,
          paymentGatewayBillingID: true,
          createdAt: true,
          paymentAt: true,
          updatedAt: true,
          deletedAt: true,
          order: {
            select: {
              id: true,
              status: true,
              updatedAt: true
            }
          },
          customer: {
            select: {
              id: true
            }
          }
        }
      })

      if (found === null) return success({ foundBilling: null })

      const resultValidateOrderID = ID.validate({ id: found.order.id, modelName: ModelName.ORDER })
      if (resultValidateOrderID.isFailure()) return failure(resultValidateOrderID.value)
      const { idValidated: orderID } = resultValidateOrderID.value

      const resultValidateCustomerID = ID.validate({ id: found.customer.id, modelName: ModelName.CUSTOMER })
      if (resultValidateCustomerID.isFailure()) return failure(resultValidateCustomerID.value)
      const { idValidated: customerID } = resultValidateCustomerID.value

      const resultValidateBillingID = ID.validate({ id: found.id, modelName: ModelName.BILLING })
      if (resultValidateBillingID.isFailure()) return failure(resultValidateBillingID.value)
      const { idValidated: billingID } = resultValidateBillingID.value

      return success({
        foundBilling: {
          id: billingID,
          order: { id: orderID, status: found.order.status as OrderStatus, updatedAt: found.order.updatedAt },
          customer: { id: customerID },
          status: found.status as BillingStatus,
          paymentGatewayBillingID: found.paymentGatewayBillingID,
          paymentURL: found.paymentURL,
          amountInCents: found.amountInCents,
          paymentMethod: found.paymentMethod as PaymentMethod,
          paymentGateway: found.paymentGateway as PaymentGateway,
          createdAt: found.createdAt,
          paymentAt: found.paymentAt,
          updatedAt: found.updatedAt,
          deletedAt: found.deletedAt
        }
      })
    } catch (error: unknown) {
      const repositoryError = this.handleRepositoryError(error, 'find by external ID')
      this.logger.sendLogError({ message: repositoryError.errorMessage, value: repositoryError })
      return failure(repositoryError)
    }
  }

  public async updateStatusAndOrder(
    parameters: UpdateStatusAndUpdateOrderBillingsRepositoryDTO.Parameters
  ): UpdateStatusAndUpdateOrderBillingsRepositoryDTO.Result {
    try {
      await this.database.prisma.$transaction(async (prisma) => {
        await prisma.billing.update({
          where: { id: parameters.billing.id.value },
          data: {
            status: parameters.billing.status,
            updatedAt: parameters.billing.updatedAt
          }
        })

        await prisma.order.update({
          where: { id: parameters.order.id.value },
          data: {
            status: parameters.order.status,
            updatedAt: parameters.order.updatedAt
          }
        })
      })
      return success(null)
    } catch (error: unknown) {
      const repositoryError = this.handleRepositoryError(error, 'update status and order')
      this.logger.sendLogError({ message: repositoryError.errorMessage, value: repositoryError })
      return failure(repositoryError)
    }
  }

  public async save(
    parameters: SaveAndUpdateOrderBillingsRepositoryDTO.Parameters
  ): SaveAndUpdateOrderBillingsRepositoryDTO.Result {
    try {
      await this.database.prisma.$transaction(async (prisma) => {
        await prisma.billing.create({
          data: {
            id: parameters.billing.id.value,
            orderID: parameters.billing.order.id.value,
            customerID: parameters.billing.customer.id.value,
            status: parameters.billing.status,
            paymentURL: parameters.billing.paymentURL,
            amountInCents: parameters.billing.amountInCents,
            paymentMethod: parameters.billing.paymentMethod,
            createdAt: parameters.billing.createdAt,
            paymentGateway: parameters.billing.paymentGateway,
            paymentGatewayBillingID: parameters.billing.paymentGatewayBillingID,
            updatedAt: parameters.billing.updatedAt,
            deletedAt: parameters.billing.deletedAt
          },
          select: { id: true }
        })

        await prisma.order.update({
          where: { id: parameters.order.id.value },
          data: {
            status: parameters.order.status,
            updatedAt: parameters.order.updatedAt
          },
          select: { id: true }
        })
      })
      return success(null)
    } catch (error: unknown) {
      const repositoryError = this.handleRepositoryError(error, 'save')
      this.logger.sendLogError({ message: repositoryError.errorMessage, value: repositoryError })
      return failure(repositoryError)
    }
  }

  public async findByOrder(
    parameters: FindBillingByOrderBillingsRepositoryDTO.Parameters
  ): FindBillingByOrderBillingsRepositoryDTO.Result {
    try {
      const found = await this.database.prisma.billing.findUnique({
        where: {
          orderID: parameters.order.id.value,
          deletedAt: null
        },
        select: {
          id: true,
          status: true,
          paymentGatewayBillingID: true,
          updatedAt: true,
          customerID: true,
          paymentURL: true,
          amountInCents: true,
          paymentMethod: true,
          paymentGateway: true,
          createdAt: true,
          paymentAt: true,
          deletedAt: true,
          order: {
            select: {
              id: true,
              status: true
            }
          }
        }
      })

      if (found === null) return success({ foundBilling: null })

      const resultValidateOrderID = ID.validate({ id: found.order.id, modelName: ModelName.ORDER })
      if (resultValidateOrderID.isFailure()) return failure(resultValidateOrderID.value)
      const { idValidated: orderID } = resultValidateOrderID.value

      const resultValidateCustomerID = ID.validate({ id: found.customerID, modelName: ModelName.CUSTOMER })
      if (resultValidateCustomerID.isFailure()) return failure(resultValidateCustomerID.value)
      const { idValidated: customerID } = resultValidateCustomerID.value

      const resultValidateBillingID = ID.validate({ id: found.id, modelName: ModelName.BILLING })
      if (resultValidateBillingID.isFailure()) return failure(resultValidateBillingID.value)
      const { idValidated: billingID } = resultValidateBillingID.value

      const resultValidateOrderStatus = Order.validateStatus({ status: found.status })
      if (resultValidateOrderStatus.isFailure()) return failure(resultValidateOrderStatus.value)
      const { statusValidated: orderStatus } = resultValidateOrderStatus.value

      const resultValidateBillingStatus = Billing.validateStatus({ billing: { status: found.status, id: billingID } })
      if (resultValidateBillingStatus.isFailure()) return failure(resultValidateBillingStatus.value)
      const { statusValidated: billingStatus } = resultValidateBillingStatus.value

      return success({
        foundBilling: {
          id: billingID,
          order: { id: orderID, status: orderStatus, updatedAt: found.updatedAt },
          customer: { id: customerID },
          status: billingStatus,
          paymentGatewayBillingID: found.paymentGatewayBillingID,
          paymentURL: found.paymentURL,
          amountInCents: found.amountInCents,
          paymentMethod: found.paymentMethod as PaymentMethod,
          paymentGateway: found.paymentGateway as PaymentGateway,
          createdAt: found.createdAt,
          paymentAt: found.paymentAt,
          updatedAt: found.updatedAt,
          deletedAt: found.deletedAt
        }
      })
    } catch (error: unknown) {
      const repositoryError = this.handleRepositoryError(error, 'find by order')
      this.logger.sendLogError({ message: repositoryError.errorMessage, value: repositoryError })
      return failure(repositoryError)
    }
  }
}

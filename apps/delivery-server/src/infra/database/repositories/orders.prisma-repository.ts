import { Order } from '@models/order.model'
import { ID, type ILoggerProvider, ModelName, RepositoryError } from '@niki/domain'
import { failure, success } from '@niki/utils'
import {
  type FindOrderByIDOrdersRepositoryDTO,
  type IFindOrderByIDOrdersRepository
} from '@repository-contracts/orders/find-order-by-id.orders-repository'
import {
  type ISaveOrdersRepository,
  type SaveOrdersRepositoryDTO
} from '@repository-contracts/orders/save.orders-repository'
import {
  type IValidateIDOrdersRepository,
  type ValidateIDOrdersRepositoryDTO
} from '@repository-contracts/orders/validate-id.orders-repository'

import { type Database } from '../database'

export class OrdersPrismaRepository
  implements ISaveOrdersRepository, IValidateIDOrdersRepository, IFindOrderByIDOrdersRepository
{
  constructor(
    private readonly logger: ILoggerProvider,
    private readonly database: Database
  ) {}
  public async findByID(
    parameters: FindOrderByIDOrdersRepositoryDTO.Parameters
  ): FindOrderByIDOrdersRepositoryDTO.Result {
    try {
      const found = await this.database.prisma.order.findUnique({
        where: { id: parameters.order.id.value },
        select: {
          id: true,
          status: true,
          customer: { select: { id: true, name: true } }
        }
      })
      if (found === null) return success({ foundOrder: null })

      const resultValidateOrderID = ID.validate({ id: found.id, modelName: ModelName.ORDER })
      if (resultValidateOrderID.isFailure()) return failure(resultValidateOrderID.value)
      const { idValidated: orderID } = resultValidateOrderID.value

      const resultValidateStatus = Order.validateStatus({ status: found.status })
      if (resultValidateStatus.isFailure()) return failure(resultValidateStatus.value)
      const { statusValidated: orderStatus } = resultValidateStatus.value

      const resultValidateCustomerID = ID.validate({ id: found.customer.id, modelName: ModelName.CUSTOMER })
      if (resultValidateCustomerID.isFailure()) return failure(resultValidateCustomerID.value)
      const { idValidated: customerID } = resultValidateCustomerID.value

      return success({
        foundOrder: {
          id: orderID,
          customer: { id: customerID, name: found.customer.name },
          status: orderStatus
        }
      })
    } catch (error: unknown) {
      console.log(error)
      const repositoryError = new RepositoryError({
        error,
        repository: { method: 'find by id', name: 'orders', externalName: 'prisma' }
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
        select: { id: true, updatedAt: true }
      })
      if (found === null) return success({ foundOrder: null })

      const resultValidateID = ID.validate({ id: found.id, modelName: ModelName.ORDER })
      if (resultValidateID.isFailure()) return failure(resultValidateID.value)
      const { idValidated: orderID } = resultValidateID.value

      return success({
        foundOrder: {
          id: orderID
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

  public async save(parameters: SaveOrdersRepositoryDTO.Parameters): SaveOrdersRepositoryDTO.Result {
    try {
      await this.database.prisma.order.create({
        data: {
          createdAt: parameters.order.createdAt,
          updatedAt: parameters.order.updatedAt,
          deletedAt: parameters.order.deletedAt,
          id: parameters.order.id.value,
          status: parameters.order.status,
          customerID: parameters.order.customer.id.value
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

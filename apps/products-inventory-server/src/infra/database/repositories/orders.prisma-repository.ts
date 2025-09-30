import { ID, type ILoggerProvider, ModelName, RepositoryError } from '@niki/domain'
import { failure, success } from '@niki/utils'
import {
  type ISaveOrdersRepository,
  type SaveOrdersRepositoryDTO
} from '@repository-contracts/orders/save.orders-repository'
import {
  type IUpdateOrderProductsReservationRepository,
  type UpdateOrderProductsReservationRepositoryDTO
} from '@repository-contracts/orders/update-order-products-reservation.orders-repository'
import {
  type IValidateIDOrdersRepository,
  type ValidateIDOrdersRepositoryDTO
} from '@repository-contracts/orders/validate-id.orders-repository'

import { type Prisma } from '../../../../generated/prisma'
import { type Database } from '../database'

export class OrdersPrismaRepository
  implements IValidateIDOrdersRepository, ISaveOrdersRepository, IUpdateOrderProductsReservationRepository
{
  constructor(
    private readonly logger: ILoggerProvider,
    private readonly database: Database
  ) {}

  public async validateID(parameters: ValidateIDOrdersRepositoryDTO.Parameters): ValidateIDOrdersRepositoryDTO.Result {
    try {
      const found = await this.database.prisma.order.findUnique({
        where: { id: parameters.order.id.value },
        select: { id: true }
      })

      if (found === null) return success({ foundOrder: null })

      const resultValidateID = ID.validate({ id: found.id, modelName: ModelName.ORDER })
      if (resultValidateID.isFailure()) return failure(resultValidateID.value)
      const { idValidated: orderID } = resultValidateID.value

      return success({ foundOrder: { id: orderID } })
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
      await this.database.prisma.$transaction(async (tx) => {
        await tx.order.create({
          data: {
            id: parameters.order.id.value,
            createdAt: parameters.order.createdAt,
            updatedAt: parameters.order.updatedAt,
            deletedAt: parameters.order.deletedAt
          },
          select: { id: true }
        })
        const orderProductReservationsData: Prisma.OrderProductReservationCreateManyInput[] =
          parameters.order.orderProductReservation.map((orderProductReservation) => ({
            orderID: parameters.order.id.value,
            productID: orderProductReservation.product.id.value,
            status: orderProductReservation.status,
            quantity: orderProductReservation.quantity,
            createdAt: parameters.order.createdAt,
            pricePerUnitInCents: orderProductReservation.pricePerUnitInCents,
            updatedAt: parameters.order.updatedAt
          }))
        await tx.orderProductReservation.createMany({ data: orderProductReservationsData })
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

  public async updateOrderProductsReservation(
    parameters: UpdateOrderProductsReservationRepositoryDTO.Parameters
  ): UpdateOrderProductsReservationRepositoryDTO.Result {
    try {
      await this.database.prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: parameters.order.id.value },
          data: { updatedAt: parameters.order.updatedAt }
        })

        for (const orderProductReservation of parameters.order.orderProductReservation) {
          await tx.orderProductReservation.update({
            where: {
              productID_orderID: {
                productID: orderProductReservation.product.id.value,
                orderID: parameters.order.id.value
              }
            },
            data: {
              status: orderProductReservation.status,
              expiresAt: orderProductReservation.expiresAt,
              updatedAt: parameters.order.updatedAt
            }
          })
        }
      })

      return success(null)
    } catch (error: unknown) {
      const repositoryError = new RepositoryError({
        error,
        repository: { method: 'updateOrderProductsReservation', name: 'orders', externalName: 'prisma' }
      })
      this.logger.sendLogError({ message: repositoryError.errorMessage, value: repositoryError })
      return failure(repositoryError)
    }
  }
}

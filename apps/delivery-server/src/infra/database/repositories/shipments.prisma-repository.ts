import { Shipment, type ShipmentStatus } from '@models/shipment.model'
import { ID, type ILoggerProvider, ModelName, RepositoryError } from '@niki/domain'
import { failure, success } from '@niki/utils'
import {
  type FindShipmentByIDShipmentsRepositoryDTO,
  type IFindShipmentByIDShipmentsRepository
} from '@repository-contracts/shipments/find-shipment-by-id.shipments-repository'
import {
  type ISaveShipmentsRepository,
  type SaveShipmentsRepositoryDTO
} from '@repository-contracts/shipments/save.shipments-repository'
import {
  type IUpdateShipmentShipmentsRepository,
  type UpdateShipmentShipmentsRepositoryDTO
} from '@repository-contracts/shipments/update-shipment.shipments-repository'

import { type Database } from '../database'

export class ShipmentsPrismaRepository
  implements IFindShipmentByIDShipmentsRepository, ISaveShipmentsRepository, IUpdateShipmentShipmentsRepository
{
  constructor(
    private readonly logger: ILoggerProvider,
    private readonly database: Database
  ) {}

  public async findByID(
    parameters: FindShipmentByIDShipmentsRepositoryDTO.Parameters
  ): FindShipmentByIDShipmentsRepositoryDTO.Result {
    try {
      const found = await this.database.prisma.shipment.findUnique({
        where: { id: parameters.shipment.id.value },
        include: {
          customer: true,
          order: true,
          deliveredByEmployee: true,
          shipmentProducts: { select: { productID: true, quantity: true } }
        }
      })

      if (found === null) return success({ foundShipment: null })

      const resultValidateShipmentID = ID.validate({ id: found.id, modelName: ModelName.SHIPMENT })
      if (resultValidateShipmentID.isFailure()) return failure(resultValidateShipmentID.value)
      const { idValidated: shipmentID } = resultValidateShipmentID.value

      const resultValidateOrderID = ID.validate({ id: found.order.id, modelName: ModelName.ORDER })
      if (resultValidateOrderID.isFailure()) return failure(resultValidateOrderID.value)
      const { idValidated: orderID } = resultValidateOrderID.value

      const resultValidateCustomerID = ID.validate({ id: found.customer.id, modelName: ModelName.CUSTOMER })
      if (resultValidateCustomerID.isFailure()) return failure(resultValidateCustomerID.value)
      const { idValidated: customerID } = resultValidateCustomerID.value

      let deliveredByEmployeeID = null
      if (found.deliveredByEmployee) {
        const resultValidateEmployeeID = ID.validate({
          id: found.deliveredByEmployee.id,
          modelName: ModelName.EMPLOYEE
        })
        if (resultValidateEmployeeID.isFailure()) return failure(resultValidateEmployeeID.value)
        deliveredByEmployeeID = { id: resultValidateEmployeeID.value.idValidated }
      }

      const shipment = new Shipment({
        id: shipmentID,
        status: found.status as ShipmentStatus,
        order: { id: orderID },
        customer: { id: customerID },
        deliveredByEmployee: deliveredByEmployeeID,
        deliveredAt: found.deliveredAt,
        createdAt: found.createdAt,
        updatedAt: found.updatedAt,
        deletedAt: found.deletedAt
      })

      return success({ foundShipment: shipment })
    } catch (error: unknown) {
      const repositoryError = new RepositoryError({
        error,
        repository: { method: 'find by id', name: 'shipments', externalName: 'prisma' }
      })
      this.logger.sendLogError({ message: repositoryError.errorMessage, value: repositoryError })
      return failure(repositoryError)
    }
  }

  public async save(parameters: SaveShipmentsRepositoryDTO.Parameters): SaveShipmentsRepositoryDTO.Result {
    try {
      await this.database.prisma.shipment.create({
        data: {
          id: parameters.shipment.id.value,
          status: parameters.shipment.status,
          customerID: parameters.shipment.customer.id.value,
          orderID: parameters.shipment.order.id.value,
          deliveredByEmployeeID: parameters.shipment.deliveredByEmployee?.id.value ?? null,
          deliveredAt: parameters.shipment.deliveredAt,
          createdAt: parameters.shipment.createdAt,
          updatedAt: parameters.shipment.updatedAt,
          deletedAt: parameters.shipment.deletedAt
        }
      })
      return success(null)
    } catch (error: unknown) {
      const repositoryError = new RepositoryError({
        error,
        repository: { method: 'save', name: 'shipments', externalName: 'prisma' }
      })
      this.logger.sendLogError({ message: repositoryError.errorMessage, value: repositoryError })
      return failure(repositoryError)
    }
  }

  public async update(
    parameters: UpdateShipmentShipmentsRepositoryDTO.Parameters
  ): UpdateShipmentShipmentsRepositoryDTO.Result {
    try {
      await this.database.prisma.shipment.update({
        where: { id: parameters.shipment.id.value },
        data: {
          status: parameters.shipment.status,
          deliveredByEmployeeID: parameters.shipment.deliveredByEmployee?.id.value ?? null,
          deliveredAt: parameters.shipment.deliveredAt,
          updatedAt: parameters.shipment.updatedAt
        }
      })
      return success(null)
    } catch (error: unknown) {
      const repositoryError = new RepositoryError({
        error,
        repository: { method: 'update', name: 'shipments', externalName: 'prisma' }
      })
      this.logger.sendLogError({ message: repositoryError.errorMessage, value: repositoryError })
      return failure(repositoryError)
    }
  }
}

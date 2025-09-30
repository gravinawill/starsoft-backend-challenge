import type { Employee } from './employee.model'
import type { Order } from './order.model'

import { type Customer } from '@models/customer.model'
import { type GenerateIDError, ID, InvalidShipmentStatusError, ModelName } from '@niki/domain'
import { type Either } from '@niki/utils'
import { failure, success } from '@niki/utils'

export enum ShipmentStatus {
  SHIPMENT_CREATED = 'SHIPMENT_CREATED',
  DELIVERY_FAILED = 'DELIVERY_FAILED',
  DELIVERY_COMPLETED = 'DELIVERY_COMPLETED'
}

export class Shipment {
  public readonly id: ID
  public status: ShipmentStatus
  public order: Pick<Order, 'id'>
  public customer: Pick<Customer, 'id'>

  public deliveredByEmployee: Pick<Employee, 'id'> | null
  public deliveredAt: Date | null

  public readonly createdAt: Date
  public updatedAt: Date
  public deletedAt: Date | null

  constructor(parameters: {
    id: ID
    status: ShipmentStatus
    customer: Pick<Customer, 'id'>
    deliveredByEmployee: Pick<Employee, 'id'> | null
    deliveredAt: Date | null
    order: Pick<Order, 'id'>
    createdAt: Date
    updatedAt: Date
    deletedAt: Date | null
  }) {
    this.id = parameters.id
    this.status = parameters.status
    this.order = parameters.order
    this.customer = parameters.customer
    this.deliveredByEmployee = parameters.deliveredByEmployee
    this.deliveredAt = parameters.deliveredAt
    this.createdAt = parameters.createdAt
    this.updatedAt = parameters.updatedAt
    this.deletedAt = parameters.deletedAt
  }

  public static create(parameters: {
    order: Pick<Order, 'id'>
    customer: Pick<Customer, 'id'>
  }): Either<GenerateIDError, { shipmentCreated: Shipment }> {
    const resultGenerateID = ID.generate({ modelName: ModelName.SHIPMENT })
    if (resultGenerateID.isFailure()) return failure(resultGenerateID.value)

    const { idGenerated: shipmentID } = resultGenerateID.value
    const now = new Date()
    const shipment = new Shipment({
      id: shipmentID,
      status: ShipmentStatus.SHIPMENT_CREATED,
      order: parameters.order,
      customer: parameters.customer,
      deliveredByEmployee: null,
      deliveredAt: null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null
    })
    return success({ shipmentCreated: shipment })
  }

  public static validateStatus(parameters: {
    shipment: { id: string; status: string }
  }): Either<InvalidShipmentStatusError, { statusValidated: ShipmentStatus }> {
    if (!Object.values(ShipmentStatus).includes(parameters.shipment.status as ShipmentStatus)) {
      return failure(
        new InvalidShipmentStatusError({
          shipmentStatus: parameters.shipment.status,
          shipmentID: parameters.shipment.id
        })
      )
    }
    return success({ statusValidated: parameters.shipment.status as ShipmentStatus })
  }

  public static deliverWithSuccess(parameters: { shipment: Shipment; deliveredByEmployee: Pick<Employee, 'id'> }): {
    shipmentDelivered: Pick<Shipment, 'id' | 'status' | 'updatedAt'> & {
      deliveredAt: Date
      deliveredByEmployee: Pick<Employee, 'id'>
      customer: Pick<Customer, 'id'>
      order: Pick<Order, 'id'>
    }
  } {
    const now = new Date()
    return {
      shipmentDelivered: {
        id: parameters.shipment.id,
        deliveredAt: now,
        deliveredByEmployee: parameters.deliveredByEmployee,
        status: ShipmentStatus.DELIVERY_COMPLETED,
        updatedAt: now,
        customer: parameters.shipment.customer,
        order: parameters.shipment.order
      }
    }
  }
}

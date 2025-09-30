import { type Customer } from '@models/customer.model'
import { type ID, InvalidOrderStatusError } from '@niki/domain'
import { type Either } from '@niki/utils'
import { failure, success } from '@niki/utils'

export enum OrderStatus {
  CREATED = 'CREATED',
  SHIPMENT_CREATED = 'SHIPMENT_CREATED',
  DELIVERY_FAILED = 'DELIVERY_FAILED',
  DELIVERY_COMPLETED = 'DELIVERY_COMPLETED'
}

export class Order {
  public readonly id: ID
  public status: OrderStatus
  public customer: Pick<Customer, 'id'>
  public readonly createdAt: Date
  public updatedAt: Date
  public deletedAt: Date | null

  constructor(parameters: {
    id: ID
    status: OrderStatus
    customer: Pick<Customer, 'id'>
    createdAt: Date
    updatedAt: Date
    deletedAt: Date | null
  }) {
    this.id = parameters.id
    this.status = parameters.status
    this.customer = parameters.customer
    this.createdAt = parameters.createdAt
    this.updatedAt = parameters.updatedAt
    this.deletedAt = parameters.deletedAt
  }

  public static create(parameters: { orderID: ID; customer: Pick<Customer, 'id'>; createdAt: Date; updatedAt: Date }): {
    orderCreated: Order
  } {
    const order = new Order({
      id: parameters.orderID,
      status: OrderStatus.CREATED,
      customer: parameters.customer,
      createdAt: parameters.createdAt,
      updatedAt: parameters.updatedAt,
      deletedAt: null
    })
    return { orderCreated: order }
  }

  public static validateStatus(parameters: {
    status: string
  }): Either<InvalidOrderStatusError, { statusValidated: OrderStatus }> {
    if (!Object.values(OrderStatus).includes(parameters.status as OrderStatus)) {
      return failure(new InvalidOrderStatusError({ orderStatus: parameters.status }))
    }
    return success({ statusValidated: parameters.status as OrderStatus })
  }
}

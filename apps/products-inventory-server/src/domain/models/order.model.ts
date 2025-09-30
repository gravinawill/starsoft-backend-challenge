import { type GenerateIDError, type ID } from '@niki/domain'
import { type Either, success } from '@niki/utils'

import { type Product } from './product.model'

export enum OrderProductReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED'
}

export type OrderProductReservation = {
  expiresAt: Date | null
  product: Pick<Product, 'id'>
  status: OrderProductReservationStatus
  quantity: number
  pricePerUnitInCents: number
}

export class Order {
  readonly id: ID
  orderProductReservation: OrderProductReservation[]
  readonly createdAt: Date
  updatedAt: Date
  deletedAt: Date | null

  constructor(parameters: {
    id: ID
    orderProductReservation: OrderProductReservation[]
    createdAt: Date
    updatedAt: Date
    deletedAt: Date | null
  }) {
    this.id = parameters.id
    this.orderProductReservation = parameters.orderProductReservation
    this.createdAt = parameters.createdAt
    this.updatedAt = parameters.updatedAt
    this.deletedAt = parameters.deletedAt
  }

  public static create(parameters: {
    orderID: ID
    createdAt: Date
    updatedAt: Date
    orderProductReservation: Array<Pick<OrderProductReservation, 'product' | 'quantity' | 'pricePerUnitInCents'>>
  }): Either<GenerateIDError, { orderCreated: Order }> {
    return success({
      orderCreated: new Order({
        id: parameters.orderID,
        orderProductReservation: parameters.orderProductReservation.map((orderProductReservation) => ({
          status: OrderProductReservationStatus.PENDING,
          expiresAt: null,
          product: orderProductReservation.product,
          quantity: orderProductReservation.quantity,
          pricePerUnitInCents: orderProductReservation.pricePerUnitInCents
        })),
        createdAt: parameters.createdAt,
        updatedAt: parameters.updatedAt,
        deletedAt: null
      })
    })
  }

  public addExpiresAtToOrderProductReservation(): void {
    const NOW_PLUS_15_MINUTES = new Date(Date.now() + 15 * 60 * 1000)
    for (const orderProductReservation of this.orderProductReservation) {
      orderProductReservation.expiresAt = NOW_PLUS_15_MINUTES
    }
    this.updatedAt = new Date()
  }

  public confirmOrderProductReservation(): void {
    for (const orderProductReservation of this.orderProductReservation) {
      orderProductReservation.status = OrderProductReservationStatus.CONFIRMED
    }
    this.updatedAt = new Date()
  }
}

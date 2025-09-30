import { z } from 'zod'

import { type BaseEventContract } from '../_index'

export const ORDER_CREATED_EVENT_CONTRACT_TYPE = 'orders.order-created' as const

export type OrdersOrderCreatedEventPayload = {
  orderID: string
  customerID: string
  paymentMethod: string
  status: string
  products: Array<{ id: string; quantity: number }>
  createdAt: Date
  updatedAt: Date
}
export type OrdersOrderCreatedEvent = BaseEventContract<OrdersOrderCreatedEventPayload>

export const ordersOrderCreatedEventPayloadSchema = z.custom<OrdersOrderCreatedEventPayload>()

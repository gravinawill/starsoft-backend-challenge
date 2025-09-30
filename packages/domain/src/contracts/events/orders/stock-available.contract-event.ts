import { z } from 'zod'

import { type BaseEventContract } from '../_index'

export const STOCK_AVAILABLE_EVENT_CONTRACT_TYPE = 'orders.stock-available' as const

export type OrdersStockAvailableEventPayload = {
  orderID: string
  customerID: string
  products: Array<{ id: string; quantity: number; priceInCents: number }>
  createdAt: Date
  updatedAt: Date
}
export type OrdersStockAvailableEvent = BaseEventContract<OrdersStockAvailableEventPayload>

export const ordersStockAvailableEventPayloadSchema = z.custom<OrdersStockAvailableEventPayload>()

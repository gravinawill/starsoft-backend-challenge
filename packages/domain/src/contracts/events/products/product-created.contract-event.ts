import { z } from 'zod'

import { type BaseEventContract } from '../_index'

export const PRODUCT_CREATED_EVENT_CONTRACT_TYPE = 'products.created' as const

export type ProductsProductCreatedEventPayload = {
  productID: string
  name: string
  imageURL: string | null
  priceInCents: number
  isAvailable: boolean
  createdAt: Date
  updatedAt: Date
}
export type ProductsProductCreatedEvent = BaseEventContract<ProductsProductCreatedEventPayload>

export const productsProductCreatedEventPayloadSchema = z.custom<ProductsProductCreatedEventPayload>()

import { z } from 'zod'

import { type BaseEventContract } from '../_index'

export const PRODUCT_UPDATED_IMAGE_URL_EVENT_CONTRACT_TYPE = 'products.updated-image-url' as const

export type ProductsProductUpdatedImageURLEventPayload = {
  productID: string
  imageURL: string
  updatedAt: Date
}

export type ProductsProductUpdatedImageURLEvent = BaseEventContract<ProductsProductUpdatedImageURLEventPayload>

export const productsProductUpdatedImageURLEventPayloadSchema = z.custom<ProductsProductUpdatedImageURLEventPayload>()

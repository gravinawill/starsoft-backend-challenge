import { z } from 'zod'

export type Product = {
  id: string
  name: string
  priceInCents: number
  imageURL: string | null
  isAvailable: boolean
  createdAt: string
}

export const SortOrderSearchProductsEnumSchema = z.enum(['asc', 'desc'])
export type SortOrderSearchProductsEnum = z.infer<typeof SortOrderSearchProductsEnumSchema>

export const SortBySearchProductsEnumSchema = z.enum(['name', 'is-available', 'price-in-cents', 'created-at'])
export type SortBySearchProductsEnum = z.infer<typeof SortBySearchProductsEnumSchema>

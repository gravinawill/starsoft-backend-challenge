import { z } from '@hono/zod-openapi'
import { SortBySearchProductsEnumSchema, SortOrderSearchProductsEnumSchema } from '@models/product'
import {
  ErrorResponseSchema,
  PaginationMetadataSchema,
  PaginationQuerySchema,
  stringToBoolean,
  stringToInteger
} from '@schemas/shared.schemas'

export const ProductSchema = z
  .object({
    id: z.uuid().openapi({
      example: '01JCQ8H7G2K3L4M5N6P7Q8R9S',
      description: 'Unique product identifier (ULID format)'
    }),
    name: z.string().openapi({
      example: 'Wireless Bluetooth Headphones',
      description: 'Product name'
    }),
    price_in_cents: z.number().openapi({
      example: 2999,
      description: 'Product price in cents (e.g., 2999 = $29.99)'
    }),
    image_url: z.url().nullable().openapi({
      example: 'https://example.com/images/headphones.jpg',
      description: 'URL of the product image'
    }),
    is_available: z.boolean().openapi({
      example: true,
      description: 'Whether the product is currently available in inventory'
    }),
    created_at: z.iso.datetime().openapi({
      example: '2024-01-15T10:30:00Z',
      description: 'Product creation timestamp (ISO 8601)'
    })
  })
  .openapi('Product')

export const SearchProductsQuerySchema = PaginationQuerySchema.extend({
  name: z.string().max(100, 'Search term cannot exceed 100 characters').optional().openapi({
    example: 'wireless headphones',
    description: 'Search term to filter products by name'
  }),
  min_price_in_cents: z
    .preprocess(stringToInteger, z.number().int().min(0, { error: 'Minimum price must be greater than or equal to 0' }))
    .optional()
    .openapi({
      example: 1000,
      description: 'Minimum price filter in cents (e.g., 1000 = $10.00)'
    }),
  max_price_in_cents: z
    .preprocess(stringToInteger, z.number().int().min(0, { error: 'Maximum price must be greater than or equal to 0' }))
    .optional()
    .openapi({
      example: 5000,
      description: 'Maximum price filter in cents (e.g., 5000 = $50.00)'
    }),
  is_available: z.preprocess(stringToBoolean, z.boolean().optional()).openapi({
    example: true,
    description: 'Filter by product availability status'
  }),
  sort_by: SortBySearchProductsEnumSchema.optional().default('name').openapi({
    example: 'price_in_cents',
    description: 'Field to sort results by'
  }),
  sort_order: SortOrderSearchProductsEnumSchema.optional().default('asc').openapi({
    example: 'asc',
    description: 'Sort order (ascending or descending)'
  })
}).openapi('SearchProductsQuery')

export const SearchProductsSuccessResponseSchema = z
  .object({
    success: z.object({
      products: z.array(ProductSchema).openapi({
        example: [
          {
            id: '01JCQ8H7G2K3L4M5N6P7Q8R9S',
            name: 'Wireless Bluetooth Headphones',
            price_in_cents: 2999,
            image_url: 'https://example.com/images/headphones.jpg',
            is_available: true,
            created_at: '2024-01-15T10:30:00Z'
          }
        ],
        description: 'Array of products matching the search criteria'
      }),
      message: z.string().openapi({
        example: 'Products found successfully',
        description: 'Success message'
      }),
      pagination: PaginationMetadataSchema.openapi({
        description: 'Pagination metadata for the search results'
      })
    })
  })
  .openapi('SearchProductsSuccessResponse')

export const SearchProductsErrorResponseSchema = ErrorResponseSchema.openapi('SearchProductsErrorResponse')

export type SearchProductsQuery = z.infer<typeof SearchProductsQuerySchema>
export type SearchProductsSuccessResponse = z.infer<typeof SearchProductsSuccessResponseSchema>
export type SearchProductsErrorResponse = z.infer<typeof SearchProductsErrorResponseSchema>

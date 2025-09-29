import { createRoute } from '@hono/zod-openapi'
import { ValidationErrorResponseSchema } from '@schemas/shared.schemas'

import {
  SearchProductsErrorResponseSchema,
  SearchProductsQuerySchema,
  SearchProductsSuccessResponseSchema
} from './search-product.schema'

export const searchProductsRoute = createRoute({
  method: 'get',
  path: '/products',
  tags: ['Products'],
  operationId: 'search-products',
  summary: 'Search and filter products',
  request: {
    query: SearchProductsQuerySchema
  },
  responses: {
    400: {
      description: 'Invalid request parameters - validation errors',
      content: { 'application/json': { schema: SearchProductsErrorResponseSchema } }
    },
    200: {
      description: 'Products found successfully',
      content: { 'application/json': { schema: SearchProductsSuccessResponseSchema } }
    },
    422: {
      description: 'Validation errors',
      content: { 'application/json': { schema: ValidationErrorResponseSchema } }
    }
  }
})

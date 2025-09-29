import { type OpenAPIHono } from '@hono/zod-openapi'
import { searchProductsController } from 'src/controllers/products/search-products.controller'

import { searchProductsRoute } from './search-products/search-products.route'

export function productsRoutes(app: OpenAPIHono): void {
  app.openapi(searchProductsRoute, searchProductsController)
}

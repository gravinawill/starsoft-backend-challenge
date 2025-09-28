import { createProductController } from '@controllers/products/create-product.controller'
import { type OpenAPIHono } from '@hono/zod-openapi'

import { createProductRoute } from './create-product.route'

export function productsRoutes(app: OpenAPIHono): void {
  app.openapi(createProductRoute, createProductController)
}

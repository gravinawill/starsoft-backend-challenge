import { type OpenAPIHono } from '@hono/zod-openapi'

import { docsRoutes } from './docs.routes'
import { healthRoutes } from './health.routes'
import { productsRoutes } from './products/products.routes'

export function routes(app: OpenAPIHono): void {
  healthRoutes(app)
  productsRoutes(app)
  docsRoutes(app)
}

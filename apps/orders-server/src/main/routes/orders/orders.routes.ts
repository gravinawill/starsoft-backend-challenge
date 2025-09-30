import { createOrderController } from '@controllers/orders/create-order.controller'
import { type OpenAPIHono } from '@hono/zod-openapi'

import { createOrderRoute } from './create-order.route'

export function ordersRoutes(app: OpenAPIHono): void {
  app.openapi(createOrderRoute, createOrderController)
}

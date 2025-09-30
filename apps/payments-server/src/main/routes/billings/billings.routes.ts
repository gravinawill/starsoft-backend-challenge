import { getBillingByOrderController } from '@controllers/billings/get-billing-by-order.controller'
import { type OpenAPIHono } from '@hono/zod-openapi'

import { getBillingByOrderRoute } from './get-billing.route'

export function billingsRoutes(app: OpenAPIHono): void {
  app.openapi(getBillingByOrderRoute, getBillingByOrderController)
}

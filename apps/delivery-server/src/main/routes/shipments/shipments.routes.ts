import { deliverShipmentController } from '@controllers/shipments/deliver-shipment.controller'
import { type OpenAPIHono } from '@hono/zod-openapi'

import { deliverShipmentRoute } from './deliver-shipment.route'

export function shipmentsRoutes(app: OpenAPIHono): void {
  app.openapi(deliverShipmentRoute, deliverShipmentController)
}

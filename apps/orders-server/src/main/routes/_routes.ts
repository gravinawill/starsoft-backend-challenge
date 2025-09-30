import { type OpenAPIHono } from '@hono/zod-openapi'
import { ordersServerENV } from '@niki/env'
import { Scalar } from '@scalar/hono-api-reference'

import { version } from '../../../package.json'

import { healthRoutes } from './health.routes'
import { ordersRoutes } from './orders/orders.routes'

export function routes(app: OpenAPIHono): void {
  healthRoutes(app)
  ordersRoutes(app)

  app.get(
    '/docs',
    Scalar({
      theme: 'deepSpace',
      darkMode: true,
      hideModels: true,
      content: app.getOpenAPI31Document({
        openapi: '3.2.0',
        tags: [
          { name: 'Products', description: 'Product related endpoints' },
          { name: 'Health', description: 'Health check endpoints' }
        ],
        info: { title: 'Product Inventory API', version },
        servers: [
          {
            url: `http://localhost:${ordersServerENV.ORDERS_SERVER_PORT}`,
            description: 'Local Development Server'
          }
        ]
      })
    })
  )

  app.get('/', (c) => {
    return c.json({
      success: {
        data: {
          name: 'Product Inventory Server',
          version: '1.0.0',
          status: 'running'
        },
        message: 'Server is running successfully'
      },
      error: null
    })
  })
}

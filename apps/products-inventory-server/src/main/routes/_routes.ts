import { type OpenAPIHono } from '@hono/zod-openapi'
import { productsInventoryServerENV } from '@niki/env'
import { Scalar } from '@scalar/hono-api-reference'

import { version } from '../../../package.json'

import { healthRoutes } from './health.routes'
import { productsRoutes } from './products/products.routes'

export function routes(app: OpenAPIHono): void {
  healthRoutes(app)
  productsRoutes(app)

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
        info: {
          title: 'Product Inventory API',
          version,
          description: 'API for managing product inventory with JWT authentication for employee access'
        },
        servers: [
          {
            url: `http://localhost:${productsInventoryServerENV.PRODUCT_INVENTORY_SERVER_PORT}`,
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

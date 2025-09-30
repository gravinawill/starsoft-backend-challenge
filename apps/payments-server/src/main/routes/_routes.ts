import { type OpenAPIHono } from '@hono/zod-openapi'
import { paymentsServerENV } from '@niki/env'
import { Scalar } from '@scalar/hono-api-reference'

import { version } from '../../../package.json'

import { abacatePayRoutes } from './abacate-pay/webhook.route'
import { billingsRoutes } from './billings/billings.routes'
import { healthRoutes } from './health.routes'

export function routes(app: OpenAPIHono): void {
  healthRoutes(app)
  billingsRoutes(app)
  abacatePayRoutes(app)
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
            url: `http://localhost:${paymentsServerENV.PAYMENTS_SERVER_PORT}`,
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

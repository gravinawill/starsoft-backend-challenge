import { type OpenAPIHono } from '@hono/zod-openapi'
import { productsCatalogServerENV } from '@niki/env'
import { Scalar } from '@scalar/hono-api-reference'

import { version } from '../../package.json'

export function docsRoutes(app: OpenAPIHono): void {
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
          { name: 'Health', description: 'Health check endpoints' },
          { name: 'Metrics', description: 'System metrics and monitoring endpoints' }
        ],
        info: { title: 'Product Catalog API', version },
        servers: [
          {
            url: `http://localhost:${productsCatalogServerENV.PRODUCTS_CATALOG_SERVER_PORT}`,
            description: 'Local Development Server'
          }
        ]
      })
    })
  )
}

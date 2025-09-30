import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

import { messageBrokerProviderENV } from '../packages/message-broker-provider.env'
import { tokenProviderENV } from '../packages/token-provider.env'
import { serverENV } from '../shared/server.env'

export const productsCatalogServerENV = createEnv({
  extends: [messageBrokerProviderENV, tokenProviderENV, serverENV],
  server: {
    PRODUCTS_CATALOG_SERVER_PORT: z
      .string()
      .transform(Number)
      .refine((val) => Number.isInteger(val) && val > 0, {
        message: 'PRODUCTS_CATALOG_SERVER_PORT must be a positive integer'
      })
      .optional()
      .transform(Number),
    ELASTICSEARCH_HOST: z.url().optional().default('http://localhost:9200'),
    ELASTICSEARCH_INDEX_PRODUCTS: z.string(),
    ELASTICSEARCH_REQUEST_TIMEOUT: z
      .string()
      .transform(Number)
      .refine((val) => Number.isInteger(val) && val > 0, {
        message: 'ELASTICSEARCH_REQUEST_TIMEOUT must be a positive integer'
      })
      .optional()
      .default(30_000)
      .transform(Number),
    ELASTICSEARCH_MAX_RETRIES: z
      .string()
      .transform(Number)
      .refine((val) => Number.isInteger(val) && val >= 0, {
        message: 'ELASTICSEARCH_MAX_RETRIES must be a non-negative integer'
      })
      .optional()
      .default(3)
      .transform(Number)
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true
})

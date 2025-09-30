import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

import { messageBrokerProviderENV } from '../packages/message-broker-provider.env'
import { tokenProviderENV } from '../packages/token-provider.env'
import { serverENV } from '../shared/server.env'

export const ordersServerENV = createEnv({
  extends: [tokenProviderENV, messageBrokerProviderENV, serverENV],
  server: {
    ORDERS_SERVER_PORT: z
      .string()
      .optional()
      .default('3000')
      .transform(Number)
      .refine((val) => Number.isInteger(val) && val > 0, {
        message: 'ORDERS_SERVER_PORT must be a positive integer'
      }),
    ORDERS_SERVER_DATABASE_URL: z.url(),
    ELASTICSEARCH_HOST: z.url().optional().default('http://localhost:9200'),
    ELASTICSEARCH_INDEX_ORDERS: z.string().optional().default('orders.created'),
    ELASTICSEARCH_REQUEST_TIMEOUT: z
      .string()
      .optional()
      .default('30000')
      .transform(Number)
      .refine((val) => Number.isInteger(val) && val > 0, {
        message: 'ELASTICSEARCH_REQUEST_TIMEOUT must be a positive integer'
      }),
    ELASTICSEARCH_MAX_RETRIES: z
      .string()
      .optional()
      .default('3')
      .transform(Number)
      .refine((val) => Number.isInteger(val) && val >= 0, {
        message: 'ELASTICSEARCH_MAX_RETRIES must be a non-negative integer'
      })
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true
})

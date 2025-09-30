import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

import { messageBrokerProviderENV } from '../packages/message-broker-provider.env'
import { tokenProviderENV } from '../packages/token-provider.env'
import { serverENV } from '../shared/server.env'

export const productsInventoryServerENV = createEnv({
  extends: [messageBrokerProviderENV, tokenProviderENV, serverENV],
  server: {
    PRODUCT_INVENTORY_SERVER_PORT: z
      .string()
      .transform(Number)
      .refine((val) => Number.isInteger(val) && val > 0, {
        message: 'PRODUCT_INVENTORY_SERVER_PORT must be a positive integer'
      })
      .optional()
      .transform(Number),
    PRODUCT_INVENTORY_SERVER_DATABASE_URL: z.url()
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true
})

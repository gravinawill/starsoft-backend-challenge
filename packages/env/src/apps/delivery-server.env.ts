import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

import { messageBrokerProviderENV } from '../packages/message-broker-provider.env'
import { tokenProviderENV } from '../packages/token-provider.env'
import { serverENV } from '../shared/server.env'

export const deliveryServerENV = createEnv({
  extends: [messageBrokerProviderENV, tokenProviderENV, serverENV],
  server: {
    DELIVERY_SERVER_PORT: z
      .string()
      .optional()
      .default('3000')
      .transform(Number)
      .refine((val) => Number.isInteger(val) && val > 0, {
        message: 'DELIVERY_SERVER_PORT must be a positive integer'
      }),
    DELIVERY_SERVER_DATABASE_URL: z.url()
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true
})

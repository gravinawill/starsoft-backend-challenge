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
    POSTGRESQL_HOST: z.string(),
    POSTGRESQL_PORT: z.string(),
    POSTGRESQL_DATABASE_ORDERS_SERVER: z.string(),
    POSTGRESQL_USERNAME: z.string(),
    POSTGRESQL_PASSWORD: z.string()
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true
})

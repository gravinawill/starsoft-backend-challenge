import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

import { messageBrokerProviderENV } from '../packages/message-broker-provider.env'
import { tokenProviderENV } from '../packages/token-provider.env'
import { serverENV } from '../shared/server.env'

export const paymentsServerENV = createEnv({
  extends: [tokenProviderENV, messageBrokerProviderENV, serverENV],
  server: {
    PAYMENTS_SERVER_PORT: z
      .string()
      .optional()
      .default('3000')
      .transform(Number)
      .refine((val) => Number.isInteger(val) && val > 0, {
        message: 'PAYMENTS_SERVER_PORT must be a positive integer'
      }),
    PAYMENTS_SERVER_DATABASE_URL: z.url(),
    ABACATE_PAY_API_URL: z.url(),
    ABACATE_PAY_API_TOKEN: z.string().min(1),
    PAYMENTS_SERVER_BILLING_RETURN_URL: z.url(),
    PAYMENTS_SERVER_BILLING_COMPLETION_URL: z.url()
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true
})

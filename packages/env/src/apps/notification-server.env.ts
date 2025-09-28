import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

import { messageBrokerProviderENV } from '../packages/message-broker-provider.env'
import { serverENV } from '../shared/server.env'

export const notificationServerENV = createEnv({
  extends: [serverENV, messageBrokerProviderENV],
  server: {
    NOTIFICATION_SERVER_PORT: z
      .string()
      .transform(Number)
      .refine((val) => Number.isInteger(val) && val > 0, {
        message: 'NOTIFICATION_SERVER_PORT must be a positive integer'
      })
      .optional()
      .default(3001)
      .transform(Number),

    NOTIFICATION_SERVER_ETHEREAL_USER: z.string(),
    NOTIFICATION_SERVER_ETHEREAL_PASSWORD: z.string()
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true
})

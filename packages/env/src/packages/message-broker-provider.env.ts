import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const messageBrokerProviderENV = createEnv({
  server: {
    MESSAGE_BROKER_PROVIDER_BROKER_URL: z.string({ error: 'MESSAGE_BROKER_PROVIDER_BROKER_URL is required' })
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true
})

import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const serverENV = createEnv({
  server: {
    ENVIRONMENT: z.enum(['develop', 'production', 'staging', 'test'])
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true
})

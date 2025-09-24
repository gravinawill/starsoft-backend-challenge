import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const usersServerENV = createEnv({
  server: {
    ENVIRONMENT: z.enum(['develop', 'production', 'staging', 'test']),
    PORT: z.int().positive().optional().default(2222),
    DATABASE_URL: z.url()
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true
})

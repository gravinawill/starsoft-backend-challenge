import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const tokenProviderENV = createEnv({
  server: {
    TOKEN_PROVIDER_JWT_SECRET: z.string({ error: 'TOKEN_PROVIDER_JWT_SECRET is required' }),
    TOKEN_PROVIDER_JWT_EXPIRES_IN_MINUTES: z
      .string()
      .transform(Number)
      .refine((val) => Number.isInteger(val) && val > 0, {
        error: 'TOKEN_PROVIDER_JWT_EXPIRES_IN_MINUTES must be a positive integer'
      })
      .transform(Number),
    TOKEN_PROVIDER_JWT_ALGORITHM: z.enum(['HS256', 'HS384', 'HS512'], {
      error: 'TOKEN_PROVIDER_JWT_ALGORITHM is required'
    }),
    TOKEN_PROVIDER_JWT_ISSUER: z.string({ error: 'TOKEN_PROVIDER_JWT_ISSUER is required' })
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true
})

import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const usersServerENV = createEnv({
  extends: [],
  server: {
    ENVIRONMENT: z.enum(['develop', 'production', 'staging', 'test']),
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
    TOKEN_PROVIDER_JWT_ISSUER: z.string({ error: 'TOKEN_PROVIDER_JWT_ISSUER is required' }),
    MESSAGE_BROKER_PROVIDER_BROKER_URL: z.string({ error: 'MESSAGE_BROKER_PROVIDER_BROKER_URL is required' }),
    USERS_SERVER_PORT: z
      .string()
      .optional()
      .default('3000')
      .transform(Number)
      .refine((val) => Number.isInteger(val) && val > 0, {
        message: 'USERS_SERVER_PORT must be a positive integer'
      }),
    USERS_SERVER_DATABASE_URL: z.url()
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true
})

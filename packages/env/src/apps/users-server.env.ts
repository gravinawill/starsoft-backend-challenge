import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const usersServerENV = createEnv({
  server: {
    USERS_SERVER_ENVIRONMENT: z.enum(['develop', 'production', 'staging', 'test']),
    USERS_SERVER_PORT: z
      .string()
      .transform(Number)
      .refine((val) => Number.isInteger(val) && val > 0, {
        message: 'USERS_SERVER_PORT must be a positive integer'
      })
      .optional()
      .transform(Number),

    USERS_SERVER_DATABASE_URL: z.url(),

    USERS_SERVER_KAFKA_BROKER_URL: z.string(),

    USERS_SERVER_JWT_SECRET: z.string(),
    USERS_SERVER_JWT_EXPIRES_IN_MINUTES: z
      .string()
      .transform(Number)
      .refine((val) => Number.isInteger(val) && val > 0, {
        message: 'USERS_SERVER_JWT_EXPIRES_IN_MINUTES must be a positive integer'
      })
      .optional()
      .default(14_000)
      .transform(Number),
    USERS_SERVER_JWT_ALGORITHM: z.enum(['HS256', 'HS384', 'HS512']),
    USERS_SERVER_JWT_ISSUER: z.string()
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true
})

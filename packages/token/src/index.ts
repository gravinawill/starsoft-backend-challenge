import { type IGenerateJWTTokenProvider, type IVerifyJWTTokenProvider } from '@niki/domain'
import { makeLoggerProvider } from '@niki/logger'

import { JsonwebtokenTokenProvider } from './providers/jsonwebtoken.token-provider'

export const makeTokenProvider = (environments: {
  SECRET: string
  EXPIRES_IN_MINUTES: number
  ALGORITHM: 'HS256' | 'HS384' | 'HS512'
  ISSUER: string
}): IGenerateJWTTokenProvider & IVerifyJWTTokenProvider => {
  return new JsonwebtokenTokenProvider(makeLoggerProvider(), {
    SECRET: environments.SECRET,
    EXPIRES_IN_MINUTES: environments.EXPIRES_IN_MINUTES,
    ALGORITHM: environments.ALGORITHM,
    ISSUER: environments.ISSUER
  })
}

import { type ICompareEncryptedPasswordCryptoProvider, type IEncryptPasswordCryptoProvider } from '@niki/domain'
import { makeLoggerProvider } from '@niki/logger'

import { BcryptjsPasswordProvider } from './providers/bcryptjs.crypto-provider'

export const makeCryptoProvider = (): ICompareEncryptedPasswordCryptoProvider & IEncryptPasswordCryptoProvider =>
  new BcryptjsPasswordProvider(makeLoggerProvider())

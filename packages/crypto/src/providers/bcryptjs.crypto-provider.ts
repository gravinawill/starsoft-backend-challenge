import {
  type CompareEncryptedPasswordCryptoProviderDTO,
  type EncryptPasswordCryptoProviderDTO,
  type ICompareEncryptedPasswordCryptoProvider,
  type IEncryptPasswordCryptoProvider,
  type ISendLogErrorLoggerProvider,
  ProviderError
} from '@niki/domain'
import { failure, success } from '@niki/utils'
import bcrypt from 'bcryptjs'

export class BcryptjsPasswordProvider
  implements ICompareEncryptedPasswordCryptoProvider, IEncryptPasswordCryptoProvider
{
  constructor(private readonly loggerProvider: ISendLogErrorLoggerProvider) {}

  public async compareEncryptedPassword(
    parameters: CompareEncryptedPasswordCryptoProviderDTO.Parameters
  ): CompareEncryptedPasswordCryptoProviderDTO.Result {
    try {
      return success({
        isPasswordMatch: await bcrypt.compare(parameters.passwordDecrypted.value, parameters.passwordEncrypted.value)
      })
    } catch (error: unknown) {
      const errorProvider = new ProviderError({
        error,
        provider: {
          name: 'crypto',
          method: 'compare encrypted password',
          externalName: 'bcryptjs'
        }
      })

      this.loggerProvider.sendLogError({
        message: errorProvider.errorMessage,
        value: errorProvider
      })

      return failure(errorProvider)
    }
  }

  public async encryptPassword(
    parameters: EncryptPasswordCryptoProviderDTO.Parameters
  ): EncryptPasswordCryptoProviderDTO.Result {
    try {
      return success({
        passwordEncrypted: {
          forgotPasswordToken: null,
          lastPasswordChangeAt: null,
          forgotPasswordTokenExpirationAt: null,
          value: await bcrypt.hash(parameters.password.value, 12),
          isEncrypted: true
        }
      })
    } catch (error: unknown) {
      const errorProvider = new ProviderError({
        error,
        provider: {
          name: 'crypto',
          method: 'encrypt password',
          externalName: 'bcryptjs'
        }
      })

      this.loggerProvider.sendLogError({
        message: errorProvider.errorMessage,
        value: errorProvider
      })

      return failure(errorProvider)
    }
  }
}

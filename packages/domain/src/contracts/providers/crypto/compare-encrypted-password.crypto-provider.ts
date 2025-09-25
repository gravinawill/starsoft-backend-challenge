import { type Either } from '@niki/utils'

import { type ProviderError } from '../../../errors/shared/provider.error'
import { type Password } from '../../../value-objects/password.value-object'

export namespace CompareEncryptedPasswordCryptoProviderDTO {
  export type Parameters = Readonly<{
    passwordEncrypted: Password
    passwordDecrypted: Password
  }>

  export type ResultFailure = Readonly<ProviderError>
  export type ResultSuccess = Readonly<{ isPasswordMatch: boolean }>

  export type Result = Promise<Either<ResultFailure, ResultSuccess>>
}

export interface ICompareEncryptedPasswordCryptoProvider {
  compareEncryptedPassword(
    parameters: CompareEncryptedPasswordCryptoProviderDTO.Parameters
  ): CompareEncryptedPasswordCryptoProviderDTO.Result
}

import { type Either } from '@niki/utils'

import { type ProviderError } from '../../../errors/shared/provider.error'
import { type Password } from '../../../value-objects/password.value-object'

export namespace EncryptPasswordCryptoProviderDTO {
  export type Parameters = Readonly<{ password: Password }>

  export type ResultFailure = Readonly<ProviderError>
  export type ResultSuccess = Readonly<{
    passwordEncrypted: Password
  }>

  export type Result = Promise<Either<ResultFailure, ResultSuccess>>
}

export interface IEncryptPasswordCryptoProvider {
  encryptPassword(parameters: EncryptPasswordCryptoProviderDTO.Parameters): EncryptPasswordCryptoProviderDTO.Result
}

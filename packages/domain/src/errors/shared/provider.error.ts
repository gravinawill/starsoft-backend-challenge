import { StatusError } from '../../shared/status-error'

type ParametersConstructorDTO = {
  error: unknown
  provider: {
    /*
     * name: ProvidersNames
     * method: CryptoProviderMethods | TokenProviderMethods
     */
    name: string
    method: string
    externalName: string
  }
}

/*
 * export enum ProvidersNames {
 *   CRYPTO = 'crypto',
 *   TOKEN = 'token'
 * }
 */

/*
 * export enum TokenProviderMethods {
 *   GENERATE_JWT = 'generate jwt',
 *   VERIFY_JWT = 'verify jwt'
 * }
 */

/*
 * export enum CryptoProviderMethods {
 *   ENCRYPT_PASSWORD = 'encrypt password',
 *   COMPARE_ENCRYPTED_PASSWORD = 'compare encrypted password'
 * }
 */

export class ProviderError {
  readonly status: StatusError
  readonly errorMessage: string
  readonly name = 'ProviderError'
  readonly errorValue: unknown

  constructor(parameters: ParametersConstructorDTO) {
    this.errorMessage = `Error in ${parameters.provider.name} provider in ${parameters.provider.method} method.${
      parameters.provider.externalName === '' ? '' : ` Error in external lib name: ${parameters.provider.externalName}.`
    }`
    this.status = StatusError.PROVIDER_ERROR
    this.errorValue = parameters.error
  }
}

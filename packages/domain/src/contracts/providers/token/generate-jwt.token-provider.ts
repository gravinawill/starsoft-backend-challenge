import { type Either } from '@niki/utils'

import { type ProviderError } from '../../../errors/shared/provider.error'
import { type ID } from '../../../value-objects/id.value-object'

export namespace GenerateJWTTokenProviderDTO {
  export type Parameters = Readonly<{ userID: ID }>

  export type ResultFailure = Readonly<ProviderError>
  export type ResultSuccess = Readonly<{ jwtToken: string }>

  export type Result = Either<ResultFailure, ResultSuccess>
}

export interface IGenerateJWTTokenProvider {
  generateJWT(parameters: GenerateJWTTokenProviderDTO.Parameters): GenerateJWTTokenProviderDTO.Result
}

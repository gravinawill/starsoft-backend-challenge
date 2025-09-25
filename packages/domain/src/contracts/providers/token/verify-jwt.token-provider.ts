import { type Either } from '@niki/utils'

import { type InvalidJWTError } from '../../../errors/shared/invalid-jwt.error'
import { type ProviderError } from '../../../errors/shared/provider.error'
import { type InvalidIDError } from '../../../errors/value-objects/id/invalid-id.error'
import { type ID } from '../../../value-objects/id.value-object'

export namespace VerifyJWTTokenProviderDTO {
  export type Parameters = Readonly<{ jwtToken: string }>

  export type ResultFailure = Readonly<ProviderError | InvalidIDError | InvalidJWTError>
  export type ResultSuccess = Readonly<{ userID: ID }>

  export type Result = Either<ResultFailure, ResultSuccess>
}

export interface IVerifyJWTTokenProvider {
  verifyJWT(parameters: VerifyJWTTokenProviderDTO.Parameters): VerifyJWTTokenProviderDTO.Result
}

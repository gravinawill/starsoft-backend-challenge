import { type Product } from '@models/product.model'
import { type RepositoryError } from '@niki/domain'
import { type Either } from '@niki/utils'

export namespace SaveProductsRepositoryDTO {
  export type Parameters = Readonly<{ product: Product }>

  export type ResultFailure = Readonly<RepositoryError>
  export type ResultSuccess = Readonly<null>

  export type Result = Promise<Either<ResultFailure, ResultSuccess>>
}

export interface ISaveProductsRepository {
  save(parameters: SaveProductsRepositoryDTO.Parameters): SaveProductsRepositoryDTO.Result
}

import { type Product } from '@models/product.model'
import { type InvalidIDError, type RepositoryError } from '@niki/domain'
import { type Either } from '@niki/utils'

export namespace ValidateIDProductsRepositoryDTO {
  export type Parameters = Readonly<{ product: Pick<Product, 'id'> }>

  export type ResultFailure = Readonly<RepositoryError | InvalidIDError>
  export type ResultSuccess = Readonly<{
    foundProduct: null | Pick<Product, 'id' | 'name'>
  }>

  export type Result = Promise<Either<ResultFailure, ResultSuccess>>
}

export interface IValidateIDProductsRepository {
  validateID(parameters: ValidateIDProductsRepositoryDTO.Parameters): ValidateIDProductsRepositoryDTO.Result
}

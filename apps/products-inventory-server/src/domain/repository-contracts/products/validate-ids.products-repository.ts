import { type Product } from '@models/product.model'
import { type InvalidIDError, type RepositoryError } from '@niki/domain'
import { type Either } from '@niki/utils'

export namespace ValidateIDsProductsRepositoryDTO {
  export type Parameters = Readonly<{ products: Array<Pick<Product, 'id'>> }>

  export type ResultFailure = Readonly<RepositoryError | InvalidIDError>
  export type ResultSuccess = Readonly<{
    foundProducts: Array<Pick<Product, 'id' | 'priceInCents'>>
    notFoundProducts: Array<Pick<Product, 'id'>>
  }>

  export type Result = Promise<Either<ResultFailure, ResultSuccess>>
}

export interface IValidateIDsProductsRepository {
  validateIDs(parameters: ValidateIDsProductsRepositoryDTO.Parameters): ValidateIDsProductsRepositoryDTO.Result
}

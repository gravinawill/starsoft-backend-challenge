import { type Product } from '@models/product.model'
import {
  type InvalidIDError,
  type ProductsNotEnoughStockError,
  type ProductsNotFoundError,
  type RepositoryError
} from '@niki/domain'
import { type Either } from '@niki/utils'

export namespace FindAndUpdateAvailabilityProductsRepositoryDTO {
  export type Parameters = Readonly<{
    productsToFind: Array<Pick<Product, 'id'>>
    executeWithinTransaction: (
      products: Array<Pick<Product, 'id' | 'availableCount' | 'unavailableCount' | 'priceInCents'>>
    ) => Either<
      RepositoryError | InvalidIDError | ProductsNotFoundError | ProductsNotEnoughStockError,
      { productsToUpdate: Array<Pick<Product, 'id' | 'availableCount' | 'unavailableCount' | 'updatedAt'>> }
    >
  }>

  export type ResultFailure = Readonly<
    RepositoryError | InvalidIDError | ProductsNotFoundError | ProductsNotEnoughStockError
  >
  export type ResultSuccess = Readonly<null>

  export type Result = Promise<Either<ResultFailure, ResultSuccess>>
}

export interface IFindAndUpdateAvailabilityProductsRepository {
  findAndUpdateAvailability(
    parameters: FindAndUpdateAvailabilityProductsRepositoryDTO.Parameters
  ): FindAndUpdateAvailabilityProductsRepositoryDTO.Result
}

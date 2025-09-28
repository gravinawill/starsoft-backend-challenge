import { type Employee } from '@models/employee.model'
import { Product } from '@models/product.model'
import {
  type GenerateIDError,
  type ISendLogErrorLoggerProvider,
  type ISendLogTimeUseCaseLoggerProvider,
  type RepositoryError,
  UseCase
} from '@niki/domain'
import { type Either, failure, success } from '@niki/utils'
import { type ISaveProductsRepository } from '@repository-contracts/products/save.products-repository'

export namespace CreateProductUseCaseDTO {
  export type Parameters = Readonly<{
    employee: Pick<Employee, 'id'>
    product: { name: string; priceInCents: number; availableCount: number }
  }>

  export type ResultFailure = Readonly<GenerateIDError | RepositoryError>
  export type ResultSuccess = Readonly<{
    productCreated: Pick<
      Product,
      'id' | 'name' | 'imageURL' | 'priceInCents' | 'createdAt' | 'updatedAt' | 'availableCount'
    >
  }>

  export type Result = Promise<Either<ResultFailure, ResultSuccess>>
}

export class CreateProductUseCase extends UseCase<
  CreateProductUseCaseDTO.Parameters,
  CreateProductUseCaseDTO.ResultFailure,
  CreateProductUseCaseDTO.ResultSuccess
> {
  constructor(
    loggerProvider: ISendLogTimeUseCaseLoggerProvider & ISendLogErrorLoggerProvider,
    private readonly productsRepository: ISaveProductsRepository
  ) {
    super(loggerProvider)
  }

  protected async performOperation(parameters: CreateProductUseCaseDTO.Parameters): CreateProductUseCaseDTO.Result {
    const resultCreateProduct = Product.create({
      createdByEmployee: parameters.employee,
      name: parameters.product.name,
      priceInCents: parameters.product.priceInCents,
      availableCount: parameters.product.availableCount
    })
    if (resultCreateProduct.isFailure()) return failure(resultCreateProduct.value)
    const { productCreated } = resultCreateProduct.value
    const resultSaveProduct = await this.productsRepository.save({ product: productCreated })
    if (resultSaveProduct.isFailure()) return failure(resultSaveProduct.value)
    return success({ productCreated })
  }
}

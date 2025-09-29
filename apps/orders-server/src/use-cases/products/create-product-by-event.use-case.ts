import { Product } from '@models/product.model'
import {
  ID,
  type InvalidIDError,
  type ISendLogErrorLoggerProvider,
  type ISendLogTimeUseCaseLoggerProvider,
  ModelName,
  type ProductsProductCreatedEventPayload,
  type RepositoryError,
  UseCase
} from '@niki/domain'
import { type Either, failure, success } from '@niki/utils'
import { type ISaveProductsRepository } from '@repository-contracts/products/save.products-repository'
import { type IValidateIDProductsRepository } from '@repository-contracts/products/validate-id.products-repository'

export namespace CreateProductUseCaseDTO {
  export type Parameters = Readonly<{ parameters: { event: ProductsProductCreatedEventPayload } }>

  export type ResultFailure = Readonly<RepositoryError | InvalidIDError>
  export type ResultSuccess = Readonly<null>

  export type Result = Promise<Either<ResultFailure, ResultSuccess>>
}

export class CreateProductUseCase extends UseCase<
  CreateProductUseCaseDTO.Parameters,
  CreateProductUseCaseDTO.ResultFailure,
  CreateProductUseCaseDTO.ResultSuccess
> {
  constructor(
    loggerProvider: ISendLogTimeUseCaseLoggerProvider & ISendLogErrorLoggerProvider,
    private readonly productsRepository: ISaveProductsRepository & IValidateIDProductsRepository
  ) {
    super(loggerProvider)
  }

  protected async performOperation(parameters: CreateProductUseCaseDTO.Parameters): CreateProductUseCaseDTO.Result {
    const resultValidateID = ID.validate({ id: parameters.parameters.event.productID, modelName: ModelName.PRODUCT })
    if (resultValidateID.isFailure()) return failure(resultValidateID.value)
    const { idValidated: productID } = resultValidateID.value

    const resultValidateIDFromDB = await this.productsRepository.validateID({
      product: { id: productID }
    })
    if (resultValidateIDFromDB.isFailure()) return failure(resultValidateIDFromDB.value)
    const { foundProduct } = resultValidateIDFromDB.value
    if (foundProduct !== null) return success(null)

    const product = new Product({
      id: productID,
      createdAt: parameters.parameters.event.createdAt,
      updatedAt: parameters.parameters.event.updatedAt,
      deletedAt: null
    })
    const resultSave = await this.productsRepository.save({ product })
    if (resultSave.isFailure()) return failure(resultSave.value)

    return success(null)
  }
}

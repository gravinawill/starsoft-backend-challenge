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

export namespace CreateProductByEventUseCaseDTO {
  export type Parameters = Readonly<{ event: ProductsProductCreatedEventPayload }>

  export type ResultFailure = Readonly<RepositoryError | InvalidIDError>
  export type ResultSuccess = Readonly<{ productCreated: Pick<Product, 'id'> }>

  export type Result = Promise<Either<ResultFailure, ResultSuccess>>
}

export class CreateProductByEventUseCase extends UseCase<
  CreateProductByEventUseCaseDTO.Parameters,
  CreateProductByEventUseCaseDTO.ResultFailure,
  CreateProductByEventUseCaseDTO.ResultSuccess
> {
  constructor(
    loggerProvider: ISendLogTimeUseCaseLoggerProvider & ISendLogErrorLoggerProvider,
    private readonly productsRepository: ISaveProductsRepository & IValidateIDProductsRepository
  ) {
    super(loggerProvider)
  }

  protected async performOperation(
    parameters: CreateProductByEventUseCaseDTO.Parameters
  ): CreateProductByEventUseCaseDTO.Result {
    const resultValidateID = ID.validate({ id: parameters.event.productID, modelName: ModelName.PRODUCT })
    if (resultValidateID.isFailure()) return failure(resultValidateID.value)
    const { idValidated: productID } = resultValidateID.value

    const resultValidateIDFromDB = await this.productsRepository.validateID({
      product: { id: productID }
    })
    if (resultValidateIDFromDB.isFailure()) return failure(resultValidateIDFromDB.value)
    const { foundProduct } = resultValidateIDFromDB.value
    if (foundProduct !== null) return success({ productCreated: foundProduct })

    const product = new Product({
      id: productID,
      createdAt: parameters.event.createdAt,
      updatedAt: parameters.event.updatedAt,
      deletedAt: null
    })
    const resultSave = await this.productsRepository.save({ product })
    if (resultSave.isFailure()) return failure(resultSave.value)

    return success({ productCreated: product })
  }
}

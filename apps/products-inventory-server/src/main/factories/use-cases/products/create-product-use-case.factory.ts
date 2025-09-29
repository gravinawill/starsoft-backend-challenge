import { makeProductsRepository } from '@factories/repositories/products-repository.factory'
import { type UseCase } from '@niki/domain'
import { makeLoggerProvider } from '@niki/logger'
import { CreateProductUseCase, type CreateProductUseCaseDTO } from '@use-cases/products/create-product.use-case'

export const makeCreateProductUseCase: () => UseCase<
  CreateProductUseCaseDTO.Parameters,
  CreateProductUseCaseDTO.ResultFailure,
  CreateProductUseCaseDTO.ResultSuccess
> = () => new CreateProductUseCase(makeLoggerProvider(), makeProductsRepository())

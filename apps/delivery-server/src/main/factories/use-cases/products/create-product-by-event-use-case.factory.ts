import { makeProductsRepository } from '@main/factories/repositories/products-repository.factory'
import { type UseCase } from '@niki/domain'
import { makeLoggerProvider } from '@niki/logger'
import {
  CreateProductByEventUseCase,
  type CreateProductByEventUseCaseDTO
} from '@use-cases/products/create-product-by-event.use-case'

export const makeCreateProductByEventUseCase: () => UseCase<
  CreateProductByEventUseCaseDTO.Parameters,
  CreateProductByEventUseCaseDTO.ResultFailure,
  CreateProductByEventUseCaseDTO.ResultSuccess
> = () => new CreateProductByEventUseCase(makeLoggerProvider(), makeProductsRepository())

import { makeOrdersRepository } from '@factories/repositories/orders-repository.factory'
import { makeProductsRepository } from '@factories/repositories/products-repository.factory'
import { type UseCase } from '@niki/domain'
import { makeLoggerProvider } from '@niki/logger'
import {
  VerifyStockAvailabilityUseCase,
  type VerifyStockAvailabilityUseCaseDTO
} from '@use-cases/products/verify-stock-availability.use-case'

export const makeVerifyStockAvailabilityUseCase: () => UseCase<
  VerifyStockAvailabilityUseCaseDTO.Parameters,
  VerifyStockAvailabilityUseCaseDTO.ResultFailure,
  VerifyStockAvailabilityUseCaseDTO.ResultSuccess
> = () => new VerifyStockAvailabilityUseCase(makeLoggerProvider(), makeProductsRepository(), makeOrdersRepository())

import { makeOrdersRepository } from '@factories/repositories/orders-repository.factory'
import { type UseCase } from '@niki/domain'
import { makeLoggerProvider } from '@niki/logger'
import {
  UpdateOrderAfterStockAvailableUseCase,
  type UpdateOrderAfterStockAvailableUseCaseDTO
} from '@use-cases/orders/update-order-after-stock-available.use-case'

export const makeUpdateOrderAfterStockAvailableUseCase: () => UseCase<
  UpdateOrderAfterStockAvailableUseCaseDTO.Parameters,
  UpdateOrderAfterStockAvailableUseCaseDTO.ResultFailure,
  UpdateOrderAfterStockAvailableUseCaseDTO.ResultSuccess
> = () => new UpdateOrderAfterStockAvailableUseCase(makeLoggerProvider(), makeOrdersRepository())

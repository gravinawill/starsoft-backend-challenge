import { makeOrdersRepository } from '@factories/repositories/orders-repository.factory'
import { type UseCase } from '@niki/domain'
import { makeLoggerProvider } from '@niki/logger'
import {
  UpdateOrderAfterShipmentCreatedUseCase,
  type UpdateOrderAfterShipmentCreatedUseCaseDTO
} from '@use-cases/orders/update-order-after-shipment-created.use-case'

export const makeUpdateOrderAfterShipmentCreatedUseCase: () => UseCase<
  UpdateOrderAfterShipmentCreatedUseCaseDTO.Parameters,
  UpdateOrderAfterShipmentCreatedUseCaseDTO.ResultFailure,
  UpdateOrderAfterShipmentCreatedUseCaseDTO.ResultSuccess
> = () => new UpdateOrderAfterShipmentCreatedUseCase(makeLoggerProvider(), makeOrdersRepository())

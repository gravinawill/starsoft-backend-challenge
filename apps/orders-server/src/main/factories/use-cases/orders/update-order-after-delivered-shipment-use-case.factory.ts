import { makeOrdersRepository } from '@factories/repositories/orders-repository.factory'
import { type UseCase } from '@niki/domain'
import { makeLoggerProvider } from '@niki/logger'
import {
  UpdateOrderAfterDeliveredShipmentUseCase,
  type UpdateOrderAfterDeliveredShipmentUseCaseDTO
} from '@use-cases/orders/update-order-after-delivered-shipment.use-case'

export const makeUpdateOrderAfterDeliveredShipmentUseCase: () => UseCase<
  UpdateOrderAfterDeliveredShipmentUseCaseDTO.Parameters,
  UpdateOrderAfterDeliveredShipmentUseCaseDTO.ResultFailure,
  UpdateOrderAfterDeliveredShipmentUseCaseDTO.ResultSuccess
> = () => new UpdateOrderAfterDeliveredShipmentUseCase(makeLoggerProvider(), makeOrdersRepository())

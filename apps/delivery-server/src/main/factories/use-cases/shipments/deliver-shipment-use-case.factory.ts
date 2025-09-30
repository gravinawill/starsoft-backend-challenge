import { makeShipmentsRepository } from '@main/factories/repositories/shipments-repository.factory'
import { type UseCase } from '@niki/domain'
import { makeLoggerProvider } from '@niki/logger'
import { DeliverShipmentUseCase, type DeliverShipmentUseCaseDTO } from '@use-cases/shipments/deliver-shipment.use-case'

export const makeDeliverShipmentUseCase: () => UseCase<
  DeliverShipmentUseCaseDTO.Parameters,
  DeliverShipmentUseCaseDTO.ResultFailure,
  DeliverShipmentUseCaseDTO.ResultSuccess
> = () => new DeliverShipmentUseCase(makeLoggerProvider(), makeShipmentsRepository())

import { makeShipmentsRepository } from '@main/factories/repositories/shipments-repository.factory'
import { type UseCase } from '@niki/domain'
import { makeLoggerProvider } from '@niki/logger'
import { CreateShipmentUseCase, type CreateShipmentUseCaseDTO } from '@use-cases/shipments/create-shipment.use-case'

export const makeCreateShipmentUseCase: () => UseCase<
  CreateShipmentUseCaseDTO.Parameters,
  CreateShipmentUseCaseDTO.ResultFailure,
  CreateShipmentUseCaseDTO.ResultSuccess
> = () => new CreateShipmentUseCase(makeLoggerProvider(), makeShipmentsRepository())

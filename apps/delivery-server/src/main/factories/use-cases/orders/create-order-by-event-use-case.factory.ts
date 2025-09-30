import { makeCustomersRepository } from '@factories/repositories/customers-repository.factory'
import { makeOrdersRepository } from '@factories/repositories/orders-repository.factory'
import { type UseCase } from '@niki/domain'
import { makeLoggerProvider } from '@niki/logger'
import {
  CreateOrderByEventUseCase,
  type CreateOrderByEventUseCaseDTO
} from '@use-cases/orders/create-order-by-event.use-case'

export const makeCreateOrderByEventUseCase: () => UseCase<
  CreateOrderByEventUseCaseDTO.Parameters,
  CreateOrderByEventUseCaseDTO.ResultFailure,
  CreateOrderByEventUseCaseDTO.ResultSuccess
> = () => new CreateOrderByEventUseCase(makeLoggerProvider(), makeOrdersRepository(), makeCustomersRepository())

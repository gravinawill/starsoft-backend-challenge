import { makeOrdersRepository } from '@factories/repositories/orders-repository.factory'
import { makeProductsRepository } from '@factories/repositories/products-repository.factory'
import { type UseCase } from '@niki/domain'
import { makeLoggerProvider } from '@niki/logger'
import { CreateOrderUseCase, type CreateOrderUseCaseDTO } from '@use-cases/orders/create-order.use-case'

export const makeCreateOrderUseCase: () => UseCase<
  CreateOrderUseCaseDTO.Parameters,
  CreateOrderUseCaseDTO.ResultFailure,
  CreateOrderUseCaseDTO.ResultSuccess
> = () => new CreateOrderUseCase(makeLoggerProvider(), makeProductsRepository(), makeOrdersRepository())

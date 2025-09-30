import { makeSearchOrdersRepository } from '@factories/repositories/orders-repository.factory'
import { type UseCase } from '@niki/domain'
import { makeLoggerProvider } from '@niki/logger'
import { SearchOrdersUseCase, type SearchOrdersUseCaseDTO } from '@use-cases/orders/search-orders.use-case'

export const makeSearchOrdersUseCase: () => UseCase<
  SearchOrdersUseCaseDTO.Parameters,
  SearchOrdersUseCaseDTO.ResultFailure,
  SearchOrdersUseCaseDTO.ResultSuccess
> = () => new SearchOrdersUseCase(makeLoggerProvider(), makeSearchOrdersRepository())

import { makeBillingsRepository } from '@factories/repositories/billings-repository.factory'
import { type UseCase } from '@niki/domain'
import { makeLoggerProvider } from '@niki/logger'
import {
  GetBillingByOrderUseCase,
  type GetBillingByOrderUseCaseDTO
} from '@use-cases/billings/get-billing-by-order.use-case'

export const makeGetBillingByOrderUseCase: () => UseCase<
  GetBillingByOrderUseCaseDTO.Parameters,
  GetBillingByOrderUseCaseDTO.ResultFailure,
  GetBillingByOrderUseCaseDTO.ResultSuccess
> = () => new GetBillingByOrderUseCase(makeLoggerProvider(), makeBillingsRepository())

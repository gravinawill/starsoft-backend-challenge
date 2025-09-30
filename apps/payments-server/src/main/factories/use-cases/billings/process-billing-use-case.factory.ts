import { makeBillingsRepository } from '@factories/repositories/billings-repository.factory'
import { type UseCase } from '@niki/domain'
import { makeLoggerProvider } from '@niki/logger'
import { ProcessBillingUseCase, type ProcessBillingUseCaseDTO } from '@use-cases/billings/process-billing.use-case'

export const makeProcessBillingUseCase: () => UseCase<
  ProcessBillingUseCaseDTO.Parameters,
  ProcessBillingUseCaseDTO.ResultFailure,
  ProcessBillingUseCaseDTO.ResultSuccess
> = () => new ProcessBillingUseCase(makeLoggerProvider(), makeBillingsRepository())

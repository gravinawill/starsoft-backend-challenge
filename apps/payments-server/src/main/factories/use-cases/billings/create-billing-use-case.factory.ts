import { makePaymentGatewayProvider } from '@factories/providers/payment-gateway-provider.factory'
import { makeBillingsRepository } from '@factories/repositories/billings-repository.factory'
import { makeOrdersRepository } from '@factories/repositories/orders-repository.factory'
import { type UseCase } from '@niki/domain'
import { makeLoggerProvider } from '@niki/logger'
import { CreateBillingUseCase, type CreateBillingUseCaseDTO } from '@use-cases/billings/create-billing.use-case'

export const makeCreateBillingUseCase: () => UseCase<
  CreateBillingUseCaseDTO.Parameters,
  CreateBillingUseCaseDTO.ResultFailure,
  CreateBillingUseCaseDTO.ResultSuccess
> = () =>
  new CreateBillingUseCase(
    makeLoggerProvider(),
    makeOrdersRepository(),
    makeBillingsRepository(),
    makePaymentGatewayProvider()
  )

import { makeOrdersRepository } from '@factories/repositories/orders-repository.factory'
import { type UseCase } from '@niki/domain'
import { makeLoggerProvider } from '@niki/logger'
import {
  UpdateOrderAfterAwaitingPaymentUseCase,
  type UpdateOrderAfterAwaitingPaymentUseCaseDTO
} from '@use-cases/orders/update-order-after-awaiting-payment.use-case'

export const makeUpdateOrderAfterAwaitingPaymentUseCase: () => UseCase<
  UpdateOrderAfterAwaitingPaymentUseCaseDTO.Parameters,
  UpdateOrderAfterAwaitingPaymentUseCaseDTO.ResultFailure,
  UpdateOrderAfterAwaitingPaymentUseCaseDTO.ResultSuccess
> = () => new UpdateOrderAfterAwaitingPaymentUseCase(makeLoggerProvider(), makeOrdersRepository())

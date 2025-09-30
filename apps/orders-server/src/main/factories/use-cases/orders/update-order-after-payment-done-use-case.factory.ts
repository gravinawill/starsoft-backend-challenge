import { makeOrdersRepository } from '@factories/repositories/orders-repository.factory'
import { type UseCase } from '@niki/domain'
import { makeLoggerProvider } from '@niki/logger'
import {
  UpdateOrderAfterPaymentDoneUseCase,
  type UpdateOrderAfterPaymentDoneUseCaseDTO
} from '@use-cases/orders/update-order-after-payment-done.use-case'

export const makeUpdateOrderAfterPaymentDoneUseCase: () => UseCase<
  UpdateOrderAfterPaymentDoneUseCaseDTO.Parameters,
  UpdateOrderAfterPaymentDoneUseCaseDTO.ResultFailure,
  UpdateOrderAfterPaymentDoneUseCaseDTO.ResultSuccess
> = () => new UpdateOrderAfterPaymentDoneUseCase(makeLoggerProvider(), makeOrdersRepository())

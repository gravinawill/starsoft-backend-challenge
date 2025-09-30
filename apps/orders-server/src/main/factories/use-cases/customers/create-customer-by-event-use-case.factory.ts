import { makeCustomersRepository } from '@factories/repositories/customers-repository.factory'
import { type UseCase } from '@niki/domain'
import { makeLoggerProvider } from '@niki/logger'
import {
  CreateCustomerByEventUseCase,
  type CreateCustomerByEventUseCaseDTO
} from '@use-cases/customers/create-customer-by-event.use-case'

export const makeCreateCustomerByEventUseCase: () => UseCase<
  CreateCustomerByEventUseCaseDTO.Parameters,
  CreateCustomerByEventUseCaseDTO.ResultFailure,
  CreateCustomerByEventUseCaseDTO.ResultSuccess
> = () => new CreateCustomerByEventUseCase(makeLoggerProvider(), makeCustomersRepository())

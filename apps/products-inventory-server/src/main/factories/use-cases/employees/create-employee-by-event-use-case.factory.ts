import { makeEmployeesRepository } from '@factories/repositories/employees-repository.factory'
import { type UseCase } from '@niki/domain'
import { makeLoggerProvider } from '@niki/logger'
import {
  CreateEmployeeByEventUseCase,
  type CreateEmployeeByEventUseCaseDTO
} from '@use-cases/employees/create-employee-by-event.use-case'

export const makeCreateEmployeeByEventUseCase: () => UseCase<
  CreateEmployeeByEventUseCaseDTO.Parameters,
  CreateEmployeeByEventUseCaseDTO.ResultFailure,
  CreateEmployeeByEventUseCaseDTO.ResultSuccess
> = () => new CreateEmployeeByEventUseCase(makeLoggerProvider(), makeEmployeesRepository())

import { makeCreateEmployeeByEventUseCase } from '@factories/use-cases/employees/create-employee-by-event-use-case.factory'
import { type UsersEmployeeCreatedEventPayload } from '@niki/domain'
import { makeLoggerProvider } from '@niki/logger'

export async function handleEmployeeCreated(parameters: { payload: UsersEmployeeCreatedEventPayload }): Promise<void> {
  const resultCreateEmployee = await makeCreateEmployeeByEventUseCase().execute({
    parameters: { event: parameters.payload }
  })
  if (resultCreateEmployee.isFailure()) {
    makeLoggerProvider().sendLogError({
      message: '❌ Failed to create employee',
      value: { error: resultCreateEmployee.value }
    })
  }
}

import { makeCreateCustomerByEventUseCase } from '@main/factories/use-cases/customers/create-customer-by-event-use-case.factory'
import { type UsersCustomerCreatedEventPayload } from '@niki/domain'
import { makeLoggerProvider } from '@niki/logger'

export async function handleCustomerCreated(parameters: { payload: UsersCustomerCreatedEventPayload }): Promise<void> {
  const resultCreateEmployee = await makeCreateCustomerByEventUseCase().execute({ event: parameters.payload })
  if (resultCreateEmployee.isFailure()) {
    makeLoggerProvider().sendLogError({
      message: '❌ Failed to create employee',
      value: { error: resultCreateEmployee.value }
    })
    throw new Error(resultCreateEmployee.value.errorMessage)
  } else {
    makeLoggerProvider().sendLogInfo({
      message: `✅ Customer created successfully: ${resultCreateEmployee.value.customerCreated.id.value}`
    })
  }
}

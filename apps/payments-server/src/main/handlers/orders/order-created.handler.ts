import { makeCreateOrderByEventUseCase } from '@factories/use-cases/orders/create-order-by-event-use-case.factory'
import { type OrdersOrderCreatedEventPayload } from '@niki/domain'
import { makeLoggerProvider } from '@niki/logger'

export async function handleOrderCreated(parameters: { payload: OrdersOrderCreatedEventPayload }): Promise<void> {
  const logger = makeLoggerProvider()

  const resultCreateOrder = await makeCreateOrderByEventUseCase().execute({ payload: parameters.payload })
  if (resultCreateOrder.isFailure()) {
    logger.sendLogError({
      message: '❌ Failed to create order',
      value: { error: resultCreateOrder.value }
    })
    throw new Error(resultCreateOrder.value.errorMessage)
  }

  logger.sendLogInfo({ message: resultCreateOrder.value.message })
}

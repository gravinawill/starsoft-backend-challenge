import { makeCreateOrderByEventUseCase } from '@factories/use-cases/orders/create-order-by-event-use-case.factory'
import { type OrdersStockAvailableEventPayload } from '@niki/domain'
import { makeLoggerProvider } from '@niki/logger'
import { type HandlerMessageBroker } from '@niki/message-broker/src/kafka-message-broker.provider'

export const handleStockAvailability: HandlerMessageBroker<OrdersStockAvailableEventPayload> = async (parameters) => {
  const resultCreateOrder = await makeCreateOrderByEventUseCase().execute({
    payload: {
      orderID: parameters.payload.orderID,
      customerID: parameters.payload.customerID,
      products: parameters.payload.products,
      createdAt: parameters.payload.createdAt,
      updatedAt: parameters.payload.updatedAt
    }
  })

  if (resultCreateOrder.isFailure()) {
    makeLoggerProvider().sendLogError({
      message: '❌ Failed to create billing after stock available',
      value: { error: resultCreateOrder.value }
    })
    return
  }

  makeLoggerProvider().sendLogInfo({ message: resultCreateOrder.value.message })
}

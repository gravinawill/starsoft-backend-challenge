import { makeUpdateOrderAfterStockAvailableUseCase } from '@factories/use-cases/orders/update-order-after-stock-available-use-case.factory'
import { type OrdersStockAvailableEventPayload } from '@niki/domain'
import { makeLoggerProvider } from '@niki/logger'
import { type HandlerMessageBroker } from '@niki/message-broker/src/kafka-message-broker.provider'

export const handleStockAvailability: HandlerMessageBroker<OrdersStockAvailableEventPayload> = async (parameters) => {
  const resultUpdateOrderAfterStockAvailable = await makeUpdateOrderAfterStockAvailableUseCase().execute({
    orderConfirmed: {
      orderID: parameters.payload.orderID,
      totalAmountInCents: parameters.payload.products.reduce(
        (acc, product) => acc + product.priceInCents * product.quantity,
        0
      )
    }
  })
  if (resultUpdateOrderAfterStockAvailable.isFailure()) {
    makeLoggerProvider().sendLogError({
      message: '❌ Failed to update order after stock available',
      value: { error: resultUpdateOrderAfterStockAvailable.value }
    })
  } else {
    makeLoggerProvider().sendLogInfo({ message: resultUpdateOrderAfterStockAvailable.value.message })
  }
}

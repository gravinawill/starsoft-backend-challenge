import { sendOrderCreatedEmail } from '@main/services/email/email.service'
import { type OrdersStockAvailableEventPayload } from '@niki/domain'
import { makeLoggerProvider } from '@niki/logger'
import { type HandlerMessageBroker } from '@niki/message-broker/src/kafka-message-broker.provider'

export const handleStockAvailability: HandlerMessageBroker<OrdersStockAvailableEventPayload> = async (parameters) => {
  const logger = makeLoggerProvider()
  try {
    const customer = {
      name: 'John Doe',
      email: 'john.doe@example.com'
    }
    await sendOrderCreatedEmail({
      to: { email: customer.email, name: customer.name },
      orderID: parameters.payload.orderID,
      customerID: parameters.payload.customerID
    })
  } catch (error) {
    logger.sendLogError({
      message: '❌ Failed to send order created email',
      value: {
        error: error instanceof Error ? error.message : String(error),
        orderID: parameters.payload.orderID,
        customerID: parameters.payload.customerID
      }
    })
    throw error
  }
}

import type { PaymentsPaymentDoneEventPayload } from '@niki/domain/src/contracts/events/payments/payment-done.contract-event'

import { sendPaymentDoneEmail } from '@main/services/email/email.service'
import { makeLoggerProvider } from '@niki/logger'
import { type HandlerMessageBroker } from '@niki/message-broker/src/kafka-message-broker.provider'

export const handlePaymentDone: HandlerMessageBroker<PaymentsPaymentDoneEventPayload> = async ({ payload }) => {
  const logger = makeLoggerProvider()
  try {
    // TODO: Replace with real customer lookup
    const customer = {
      name: 'John Doe',
      email: 'john.doe@example.com'
    }

    await sendPaymentDoneEmail({
      to: { email: customer.email, name: customer.name },
      orderID: payload.orderID,
      customerID: payload.customerID,
      amountInCents: payload.amountInCents,
      paymentMethod: payload.paymentMethod,
      paymentAt: payload.paymentAt
    })
  } catch (error) {
    logger.sendLogError({
      message: '❌ Failed to send payment done email',
      value: {
        error: error instanceof Error ? error.message : String(error),
        orderID: payload.orderID,
        customerID: payload.customerID
      }
    })
    throw error
  }
}

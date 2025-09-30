import { sendBillingCreatedEmail } from '@main/services/email/email.service'
import { type PaymentsAwaitingPaymentEventPayload } from '@niki/domain/src/contracts/events/payments/awaiting-payment.contract-event'
import { makeLoggerProvider } from '@niki/logger'
import { type HandlerMessageBroker } from '@niki/message-broker/src/kafka-message-broker.provider'

export const handleAwaitingPayment: HandlerMessageBroker<PaymentsAwaitingPaymentEventPayload> = async ({ payload }) => {
  const logger = makeLoggerProvider()
  try {
    // TODO: Replace with real customer lookup
    const customer = {
      name: 'John Doe',
      email: 'john.doe@example.com'
    }

    await sendBillingCreatedEmail({
      to: { email: customer.email, name: customer.name },
      orderID: payload.orderID,
      customerID: payload.customerID,
      paymentURL: payload.paymentURL,
      amountInCents: payload.amountInCents,
      paymentMethod: payload.paymentMethod
    })
  } catch (error) {
    logger.sendLogError({
      message: '❌ Failed to send billing created email',
      value: {
        error: error instanceof Error ? error.message : String(error),
        orderID: payload.orderID,
        customerID: payload.customerID
      }
    })
    throw error
  }
}

import { sendWelcomeCustomerEmail } from '@main/services/email/email.service'
import { type UsersCustomerCreatedEventPayload } from '@niki/domain'
import { makeLoggerProvider } from '@niki/logger'
import { type HandlerMessageBroker } from '@niki/message-broker/src/kafka-message-broker.provider'

export const handleCustomerCreated: HandlerMessageBroker<UsersCustomerCreatedEventPayload> = async (parameters) => {
  const logger = makeLoggerProvider()
  try {
    await sendWelcomeCustomerEmail({
      to: { email: parameters.payload.email, name: parameters.payload.name },
      customerID: parameters.payload.userID
    })
  } catch (error) {
    logger.sendLogError({
      message: '❌ Failed to send welcome email',
      value: {
        error: error instanceof Error ? error.message : String(error),
        customerId: parameters.payload.userID,
        email: parameters.payload.email
      }
    })
    throw error
  }
}

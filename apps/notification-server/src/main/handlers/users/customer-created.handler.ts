import type { UsersCustomerCreatedEventPayload } from '@niki/domain'
import type { HandlerMessageBroker } from '@niki/message-broker/src/kafka-message-broker.provider'

import { sendWelcomeCustomerEmail } from '@main/services/email/email.service'
import { makeLoggerProvider } from '@niki/logger'

export const handleCustomerCreated: HandlerMessageBroker<UsersCustomerCreatedEventPayload> = async (parameters) => {
  const logger = makeLoggerProvider()
  try {
    await sendWelcomeCustomerEmail({
      to: { email: parameters.payload.email, name: parameters.payload.name },
      logger,
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

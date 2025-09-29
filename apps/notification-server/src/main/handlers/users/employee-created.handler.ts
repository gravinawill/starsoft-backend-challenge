import { sendWelcomeEmployeeEmail } from '@main/services/email/email.service'
import { type UsersEmployeeCreatedEventPayload } from '@niki/domain'
import { makeLoggerProvider } from '@niki/logger'
import { type HandlerMessageBroker } from '@niki/message-broker/src/kafka-message-broker.provider'

export const handleEmployeeCreated: HandlerMessageBroker<UsersEmployeeCreatedEventPayload> = async (parameters) => {
  const logger = makeLoggerProvider()
  try {
    await sendWelcomeEmployeeEmail({
      to: { email: parameters.payload.email, name: parameters.payload.name },
      logger,
      employeeID: parameters.payload.userID
    })
  } catch (error) {
    logger.sendLogError({
      message: '❌ Failed to send welcome email',
      value: {
        error: error instanceof Error ? error.message : String(error),
        employeeId: parameters.payload.userID,
        email: parameters.payload.email
      }
    })
    throw error
  }
}

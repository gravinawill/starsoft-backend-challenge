import type { HandlerMessageBroker } from '@niki/message-broker/src/kafka-message-broker.provider'

import { handleCustomerCreated } from '@main/handlers/users/customer-created.handler'
import { handleEmployeeCreated } from '@main/handlers/users/employee-created.handler'
import {
  EventContractType,
  usersCustomerCreatedEventPayloadSchema,
  usersEmployeeCreatedEventPayloadSchema
} from '@niki/domain'
import { notificationServerENV } from '@niki/env'
import { ClientID, GroupID, makeMessageBrokerProvider } from '@niki/message-broker'

export async function setupEvents(): Promise<void> {
  const messageBrokerProvider = makeMessageBrokerProvider({
    brokers: [notificationServerENV.MESSAGE_BROKER_PROVIDER_BROKER_URL],
    clientID: ClientID.NOTIFICATION_SERVER
  })
  await messageBrokerProvider.processMessages({
    groupID: GroupID.NOTIFICATION_SERVER,
    functions: [
      {
        eventContractType: EventContractType.CUSTOMER_CREATED,
        handler: handleCustomerCreated as HandlerMessageBroker,
        schema: usersCustomerCreatedEventPayloadSchema
      },
      {
        eventContractType: EventContractType.EMPLOYEE_CREATED,
        handler: handleEmployeeCreated as HandlerMessageBroker,
        schema: usersEmployeeCreatedEventPayloadSchema
      }
    ]
  })
}

import { handleEmployeeCreated } from '@main/handlers/users/employee-created.handler'
import { usersEmployeeCreatedEventPayloadSchema } from '@niki/domain'
import { EventContractType } from '@niki/domain/src/contracts/events'
import { productInventoryServerENV } from '@niki/env'
import { ClientID, GroupID, makeMessageBrokerProvider } from '@niki/message-broker'
import { type HandlerMessageBroker } from '@niki/message-broker/src/kafka-message-broker.provider'

export async function setupEvents(): Promise<void> {
  const messageBrokerProvider = makeMessageBrokerProvider({
    brokers: [productInventoryServerENV.MESSAGE_BROKER_PROVIDER_BROKER_URL],
    clientID: ClientID.PRODUCTS_INVENTORY_SERVER
  })
  await messageBrokerProvider.processMessages({
    groupID: GroupID.PRODUCTS_INVENTORY_SERVER,
    functions: [
      {
        eventContractType: EventContractType.EMPLOYEE_CREATED,
        handler: handleEmployeeCreated as HandlerMessageBroker,
        schema: usersEmployeeCreatedEventPayloadSchema
      }
    ]
  })
}

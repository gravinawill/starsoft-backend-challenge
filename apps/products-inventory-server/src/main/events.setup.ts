import { handleEmployeeCreated } from '@main/handlers/users/employee-created.handler'
import {
  EventContractType,
  ordersOrderCreatedEventPayloadSchema,
  usersEmployeeCreatedEventPayloadSchema
} from '@niki/domain'
import { productsInventoryServerENV } from '@niki/env'
import { ClientID, GroupID, makeMessageBrokerProvider } from '@niki/message-broker'
import { type HandlerMessageBroker } from '@niki/message-broker/src/kafka-message-broker.provider'

import { handleOrderCreated } from './handlers/orders/order-created.handler'

export async function setupEvents(): Promise<void> {
  const messageBrokerProvider = makeMessageBrokerProvider({
    brokers: [productsInventoryServerENV.MESSAGE_BROKER_PROVIDER_BROKER_URL],
    clientID: ClientID.PRODUCTS_INVENTORY_SERVER
  })
  await messageBrokerProvider.processMessages({
    groupID: GroupID.PRODUCTS_INVENTORY_SERVER,
    functions: [
      {
        eventContractType: EventContractType.EMPLOYEE_CREATED,
        handler: handleEmployeeCreated as HandlerMessageBroker,
        schema: usersEmployeeCreatedEventPayloadSchema
      },
      {
        eventContractType: EventContractType.ORDER_CREATED,
        handler: handleOrderCreated as HandlerMessageBroker,
        schema: ordersOrderCreatedEventPayloadSchema
      }
    ]
  })
}

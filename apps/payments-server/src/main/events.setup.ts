import { handleCustomerCreated } from '@handlers/customers/customer-created.handler'
import { handleOrderCreated } from '@handlers/orders/order-created.handler'
import { handleStockAvailability } from '@handlers/orders/stock-availability.handler'
import {
  EventContractType,
  ordersOrderCreatedEventPayloadSchema,
  ordersStockAvailableEventPayloadSchema,
  usersCustomerCreatedEventPayloadSchema
} from '@niki/domain'
import { paymentsServerENV } from '@niki/env'
import { ClientID, GroupID, makeMessageBrokerProvider } from '@niki/message-broker'
import { type HandlerMessageBroker } from '@niki/message-broker/src/kafka-message-broker.provider'

export async function setupEvents(): Promise<void> {
  const messageBrokerProvider = makeMessageBrokerProvider({
    brokers: [paymentsServerENV.MESSAGE_BROKER_PROVIDER_BROKER_URL],
    clientID: ClientID.PAYMENTS_SERVER
  })
  await messageBrokerProvider.processMessages({
    groupID: GroupID.PAYMENTS_SERVER,
    functions: [
      {
        eventContractType: EventContractType.CUSTOMER_CREATED,
        handler: handleCustomerCreated as HandlerMessageBroker,
        schema: usersCustomerCreatedEventPayloadSchema
      },
      {
        eventContractType: EventContractType.STOCK_AVAILABLE,
        handler: handleStockAvailability as HandlerMessageBroker,
        schema: ordersStockAvailableEventPayloadSchema
      },
      {
        eventContractType: EventContractType.ORDER_CREATED,
        handler: handleOrderCreated as HandlerMessageBroker,
        schema: ordersOrderCreatedEventPayloadSchema
      }
    ]
  })
}

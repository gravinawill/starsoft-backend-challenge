import { handleStockAvailability } from '@handlers/orders/stock-availability.handler'
import { handlePaymentDone } from '@handlers/payments/payment-done.handler'
import { handleProductCreated } from '@handlers/products/product-created.handler'
import { handleCustomerCreated } from '@handlers/users/customer-created.handler'
import { handleEmployeeCreated } from '@handlers/users/employee-created.handler'
import {
  EventContractType,
  ordersStockAvailableEventPayloadSchema,
  paymentsPaymentDoneEventPayloadSchema,
  productsProductCreatedEventPayloadSchema,
  usersCustomerCreatedEventPayloadSchema,
  usersEmployeeCreatedEventPayloadSchema
} from '@niki/domain'
import { deliveryServerENV } from '@niki/env'
import { ClientID, GroupID, makeMessageBrokerProvider } from '@niki/message-broker'
import { type HandlerMessageBroker } from '@niki/message-broker/src/kafka-message-broker.provider'

export async function setupEvents(): Promise<void> {
  const messageBrokerProvider = makeMessageBrokerProvider({
    brokers: [deliveryServerENV.MESSAGE_BROKER_PROVIDER_BROKER_URL],
    clientID: ClientID.DELIVERY_SERVER
  })
  await messageBrokerProvider.processMessages({
    groupID: GroupID.DELIVERY_SERVER,
    functions: [
      {
        eventContractType: EventContractType.STOCK_AVAILABLE,
        handler: handleStockAvailability as HandlerMessageBroker,
        schema: ordersStockAvailableEventPayloadSchema
      },
      {
        eventContractType: EventContractType.PAYMENT_DONE,
        handler: handlePaymentDone as HandlerMessageBroker,
        schema: paymentsPaymentDoneEventPayloadSchema
      },
      {
        eventContractType: EventContractType.PRODUCT_CREATED,
        handler: handleProductCreated as HandlerMessageBroker,
        schema: productsProductCreatedEventPayloadSchema
      },
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

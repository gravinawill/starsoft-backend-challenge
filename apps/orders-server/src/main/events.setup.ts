import { handleCustomerCreated } from '@handlers/customers/customer-created.handler'
import { handleStockAvailability } from '@handlers/orders/stock-availability.handler'
import { handleAwaitingPayment } from '@handlers/payments/awaiting-payment.handler'
import { handleProductCreated } from '@handlers/products/product-created.handler'
import {
  EventContractType,
  ordersStockAvailableEventPayloadSchema,
  productsProductCreatedEventPayloadSchema,
  usersCustomerCreatedEventPayloadSchema
} from '@niki/domain'
import { paymentsAwaitingPaymentEventPayloadSchema } from '@niki/domain/src/contracts/events/payments/awaiting-payment.contract-event'
import { ordersServerENV } from '@niki/env'
import { ClientID, GroupID, makeMessageBrokerProvider } from '@niki/message-broker'
import { type HandlerMessageBroker } from '@niki/message-broker/src/kafka-message-broker.provider'

export async function setupEvents(): Promise<void> {
  const messageBrokerProvider = makeMessageBrokerProvider({
    brokers: [ordersServerENV.MESSAGE_BROKER_PROVIDER_BROKER_URL],
    clientID: ClientID.ORDERS_SERVER
  })
  await messageBrokerProvider.processMessages({
    groupID: GroupID.ORDERS_SERVER,
    functions: [
      {
        eventContractType: EventContractType.CUSTOMER_CREATED,
        handler: handleCustomerCreated as HandlerMessageBroker,
        schema: usersCustomerCreatedEventPayloadSchema
      },
      {
        eventContractType: EventContractType.PRODUCT_CREATED,
        handler: handleProductCreated as HandlerMessageBroker,
        schema: productsProductCreatedEventPayloadSchema
      },
      {
        eventContractType: EventContractType.STOCK_AVAILABLE,
        handler: handleStockAvailability as HandlerMessageBroker,
        schema: ordersStockAvailableEventPayloadSchema
      },
      {
        eventContractType: EventContractType.AWAITING_PAYMENT,
        handler: handleAwaitingPayment as HandlerMessageBroker,
        schema: paymentsAwaitingPaymentEventPayloadSchema
      }
    ]
  })
}

import { handleAwaitingPayment } from '@main/handlers/payments/awaiting-payment.handler'
import { handlePaymentDone } from '@main/handlers/payments/payment–done.handler'
import { handleStockAvailability } from '@main/handlers/products/stock-availability.handler'
import { handleCustomerCreated } from '@main/handlers/users/customer-created.handler'
import { handleEmployeeCreated } from '@main/handlers/users/employee-created.handler'
import {
  EventContractType,
  ordersStockAvailableEventPayloadSchema,
  usersCustomerCreatedEventPayloadSchema,
  usersEmployeeCreatedEventPayloadSchema
} from '@niki/domain'
import { paymentsAwaitingPaymentEventPayloadSchema } from '@niki/domain/src/contracts/events/payments/awaiting-payment.contract-event'
import { paymentsPaymentDoneEventPayloadSchema } from '@niki/domain/src/contracts/events/payments/payment-done.contract-event'
import { notificationServerENV } from '@niki/env'
import { ClientID, GroupID, makeMessageBrokerProvider } from '@niki/message-broker'
import { type HandlerMessageBroker } from '@niki/message-broker/src/kafka-message-broker.provider'

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
      },
      {
        eventContractType: EventContractType.PAYMENT_DONE,
        handler: handlePaymentDone as HandlerMessageBroker,
        schema: paymentsPaymentDoneEventPayloadSchema
      }
    ]
  })
}

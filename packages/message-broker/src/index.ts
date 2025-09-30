import { makeLoggerProvider } from '@niki/logger'

import { type IConsumerMessageBrokerProvider, KafkaMessageBrokerProvider } from './kafka-message-broker.provider'

export enum ClientID {
  ORDERS_SERVER = 'orders-server',
  PAYMENTS_SERVER = 'payments-server',
  USERS_SERVER = 'users-server',
  PRODUCTS_INVENTORY_SERVER = 'products-inventory-server',
  NOTIFICATION_SERVER = 'notification-server',
  DELIVERY_SERVER = 'delivery-server'
}

export enum GroupID {
  ORDERS_SERVER = 'orders-server',
  USERS_SERVER = 'users-server',
  PRODUCTS_INVENTORY_SERVER = 'products-inventory-server',
  NOTIFICATION_SERVER = 'notification-server',
  PAYMENTS_SERVER = 'payments-server',
  DELIVERY_SERVER = 'delivery-server'
}

export const makeMessageBrokerProvider = (parameters: {
  brokers: string[]
  clientID: ClientID
}): IConsumerMessageBrokerProvider =>
  KafkaMessageBrokerProvider.getInstance({
    config: { brokers: parameters.brokers, clientID: parameters.clientID },
    logger: makeLoggerProvider()
  })

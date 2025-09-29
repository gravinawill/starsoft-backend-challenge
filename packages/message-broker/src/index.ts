import { makeLoggerProvider } from '@niki/logger'

import { type IConsumerMessageBrokerProvider, KafkaMessageBrokerProvider } from './kafka-message-broker.provider'

export enum ClientID {
  USERS_SERVER = 'users-server',
  PRODUCTS_INVENTORY_SERVER = 'products-inventory-server',
  NOTIFICATION_SERVER = 'notification-server'
}

export enum GroupID {
  USERS_SERVER = 'users-server',
  PRODUCTS_INVENTORY_SERVER = 'products-inventory-server',
  NOTIFICATION_SERVER = 'notification-server'
}

export const makeMessageBrokerProvider = (parameters: {
  brokers: string[]
  clientID: ClientID
}): IConsumerMessageBrokerProvider =>
  KafkaMessageBrokerProvider.getInstance({
    config: { brokers: parameters.brokers, clientID: parameters.clientID },
    logger: makeLoggerProvider()
  })

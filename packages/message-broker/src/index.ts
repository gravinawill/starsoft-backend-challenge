import { makeLoggerProvider } from '@niki/logger'

import { KafkaConsumer } from './consumer'
import { type IUsersConsumerEvents, type IUsersProducerEvents } from './event-contracts/users.event-contract'
import { UsersConsumerEvents, UsersProducerEvents } from './events/users-events'
import { KafkaProducer } from './producer'

export * from './event-contracts/users.event-contract'

export const makeUsersProducerEvents = (parameters: {
  environments: { CLIENT_ID: string; BROKERS: string[] }
}): IUsersProducerEvents => {
  return new UsersProducerEvents(
    new KafkaProducer(
      {
        clientID: parameters.environments.CLIENT_ID,
        brokers: parameters.environments.BROKERS
      },
      makeLoggerProvider()
    )
  )
}

export const makeUsersConsumerEvents = (parameters: {
  environments: { CLIENT_ID: string; BROKERS: string[]; GROUP_ID: string }
}): IUsersConsumerEvents => {
  return new UsersConsumerEvents(
    new KafkaConsumer(
      {
        brokers: parameters.environments.BROKERS,
        clientID: parameters.environments.CLIENT_ID,
        groupId: parameters.environments.GROUP_ID
      },
      makeLoggerProvider()
    )
  )
}

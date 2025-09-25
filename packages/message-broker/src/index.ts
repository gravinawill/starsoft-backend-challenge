import { type IUsersConsumerEvents } from './event-contracts/users/consumer'
import { type IUsersProducerEvents } from './event-contracts/users/producer'
import { EventHandlerFactory } from './factories/event-handler-factory'

export * from './event-contracts/users/types'
export * from './health-check'

export const makeUsersProducerEvents = (parameters: {
  environments: { CLIENT_ID: string; BROKERS: string[] }
}): IUsersProducerEvents => {
  return EventHandlerFactory.getInstance().createUsersProducer({
    clientId: parameters.environments.CLIENT_ID,
    brokers: parameters.environments.BROKERS
  })
}

export const makeUsersConsumerEvents = (parameters: {
  environments: { CLIENT_ID: string; BROKERS: string[]; GROUP_ID: string }
}): IUsersConsumerEvents => {
  return EventHandlerFactory.getInstance().createUsersConsumer({
    clientId: parameters.environments.CLIENT_ID,
    brokers: parameters.environments.BROKERS,
    groupId: parameters.environments.GROUP_ID
  })
}

import type { BaseEventContract, IBaseEvent } from './base.event-contract'

import { type ProviderError } from '@niki/domain'
import { type Either } from '@niki/utils'

export enum USERS_EVENTS_NAMES {
  USER_CREATED = 'user.created',
  USER_UPDATE_AVATAR = 'user.update.avatar',
  USER_UPDATE_EMAIL = 'user.update.email',
  USER_UPDATE_PROFILE = 'user.update.profile'
}

export interface IUsersProducerEvents extends IBaseEvent {
  publishUserCreatedEvent(parameters: { payload: UserCreatedEventPayload }): Promise<Either<ProviderError, null>>
}

export interface IUsersConsumerEvents extends IBaseEvent {
  consumeUserCreatedEvent(parameters: {
    onUserCreated: (payload: UserCreatedEventPayload) => Promise<void>
  }): Promise<Either<ProviderError, { payload: UserCreatedEventPayload }>>
}

export type UserCreatedEventPayload = {
  userID: string
  email: string
  name: string
  role: string
}

// eslint-disable-next-line sonarjs/redundant-type-aliases -- For better readability
export type UserEventContract = UserCreatedEventContract

export type UserCreatedEventContract = BaseEventContract & {
  type: 'USER_CREATED'
  payload: UserCreatedEventPayload
}

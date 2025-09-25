import { type ProviderError } from '@niki/domain'
import { type Either } from '@niki/utils'

import { type IBaseEvent } from '../base.event-contract'

import { type CustomerCreatedEventPayload, type EmployeeCreatedEventPayload } from './types'

export interface IUsersConsumerEvents extends IBaseEvent {
  consumeCustomerCreatedEvent(parameters: {
    onCustomerCreated: (payload: CustomerCreatedEventPayload) => Promise<void>
  }): Promise<Either<ProviderError, { payload: CustomerCreatedEventPayload }>>

  consumeEmployeeCreatedEvent(parameters: {
    onEmployeeCreated: (payload: EmployeeCreatedEventPayload) => Promise<void>
  }): Promise<Either<ProviderError, { payload: EmployeeCreatedEventPayload }>>
}

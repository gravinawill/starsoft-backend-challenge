import { type ProviderError } from '@niki/domain'
import { type Either } from '@niki/utils'

import { type IBaseEvent } from '../base.event-contract'

import { type CustomerCreatedEventPayload, type EmployeeCreatedEventPayload } from './types'

export interface IUsersProducerEvents extends IBaseEvent {
  publishCustomerCreatedEvent(parameters: {
    payload: CustomerCreatedEventPayload
  }): Promise<Either<ProviderError, null>>

  publishEmployeeCreatedEvent(parameters: {
    payload: EmployeeCreatedEventPayload
  }): Promise<Either<ProviderError, null>>
}

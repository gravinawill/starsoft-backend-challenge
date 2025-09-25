import { type ProviderError } from '@niki/domain'
import { type Either } from '@niki/utils'
import { v7 as randomUUID_v7 } from 'uuid'

import { BaseConsumer } from '../abstractions/base-consumer'
import { BaseProducer } from '../abstractions/base-producer'
import { type IUsersConsumerEvents } from '../event-contracts/users/consumer'
import {
  type CustomerCreatedEventContract,
  type EmployeeCreatedEventContract,
  type UserEventContract
} from '../event-contracts/users/contracts'
import { type IUsersProducerEvents } from '../event-contracts/users/producer'
import {
  type CustomerCreatedEventPayload,
  type EmployeeCreatedEventPayload,
  UserEventType
} from '../event-contracts/users/types'

export class UsersProducerEvents extends BaseProducer<UserEventContract> implements IUsersProducerEvents {
  /**
   * do not use this method
   */
  protected resetState(): Promise<void> {
    throw new Error('Method not implemented.')
  }

  async publishCustomerCreatedEvent(parameters: {
    payload: CustomerCreatedEventPayload
  }): Promise<Either<ProviderError, null>> {
    const event: CustomerCreatedEventContract = {
      id: `user-customer-created-${randomUUID_v7()}`,
      type: UserEventType.CUSTOMER_CREATED,
      timestamp: new Date(),
      version: '1.0.0',
      aggregateID: parameters.payload.userID,
      payload: parameters.payload
    }
    return this.publishEvent(UserEventType.CUSTOMER_CREATED, event)
  }

  async publishEmployeeCreatedEvent(parameters: {
    payload: EmployeeCreatedEventPayload
  }): Promise<Either<ProviderError, null>> {
    const event: EmployeeCreatedEventContract = {
      id: `user-employee-created-${randomUUID_v7()}`,
      type: UserEventType.EMPLOYEE_CREATED,
      timestamp: new Date(),
      version: '1.0.0',
      aggregateID: parameters.payload.userID,
      payload: parameters.payload
    }
    return this.publishEvent(UserEventType.EMPLOYEE_CREATED, event)
  }
}

export class UsersConsumerEvents extends BaseConsumer implements IUsersConsumerEvents {
  async consumeCustomerCreatedEvent(parameters: {
    onCustomerCreated: (payload: CustomerCreatedEventPayload) => Promise<void>
  }): Promise<Either<ProviderError, { payload: CustomerCreatedEventPayload }>> {
    return this.consumeEvent(
      UserEventType.CUSTOMER_CREATED,
      UserEventType.CUSTOMER_CREATED,
      parameters.onCustomerCreated as (payload: unknown) => Promise<void>
    ) as Promise<Either<ProviderError, { payload: CustomerCreatedEventPayload }>>
  }

  async consumeEmployeeCreatedEvent(parameters: {
    onEmployeeCreated: (payload: EmployeeCreatedEventPayload) => Promise<void>
  }): Promise<Either<ProviderError, { payload: EmployeeCreatedEventPayload }>> {
    return this.consumeEvent(
      UserEventType.EMPLOYEE_CREATED,
      UserEventType.EMPLOYEE_CREATED,
      parameters.onEmployeeCreated as (payload: unknown) => Promise<void>
    ) as Promise<Either<ProviderError, { payload: EmployeeCreatedEventPayload }>>
  }
}

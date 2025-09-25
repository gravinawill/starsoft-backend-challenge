import { type BaseEventContract } from '../base.event-contract'

import { type CustomerCreatedEventPayload, type EmployeeCreatedEventPayload, type UserEventType } from './types'

export type UserEventContract = CustomerCreatedEventContract | EmployeeCreatedEventContract

export type CustomerCreatedEventContract = BaseEventContract & {
  type: UserEventType.CUSTOMER_CREATED
  payload: CustomerCreatedEventPayload
}

export type EmployeeCreatedEventContract = BaseEventContract & {
  type: UserEventType.EMPLOYEE_CREATED
  payload: EmployeeCreatedEventPayload
}

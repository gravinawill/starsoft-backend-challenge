import { z } from 'zod'

import { type BaseEventContract } from '../_index'

export const CUSTOMER_CREATED_EVENT_CONTRACT_TYPE = 'users.customer.created' as const

export type UsersCustomerCreatedEventPayload = {
  userID: string
  name: string
  email: string
  createdAt: Date
  updatedAt: Date
}

export type UsersCustomerCreatedEvent = BaseEventContract<UsersCustomerCreatedEventPayload>

export const usersCustomerCreatedEventPayloadSchema = z.custom<UsersCustomerCreatedEventPayload>()

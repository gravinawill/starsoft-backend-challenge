import { z } from 'zod'

import { type BaseEventContract } from '../_index'

export const EMPLOYEE_CREATED_EVENT_CONTRACT_TYPE = 'users.employee.created' as const

export type UsersEmployeeCreatedEventPayload = {
  userID: string
  name: string
  email: string
  createdAt: Date
  updatedAt: Date
}

export type UsersEmployeeCreatedEvent = BaseEventContract<UsersEmployeeCreatedEventPayload>

export const usersEmployeeCreatedEventPayloadSchema = z.custom<UsersEmployeeCreatedEventPayload>()

import { type Either, failure, success } from '@niki/utils'

import { PRODUCT_CREATED_EVENT_CONTRACT_TYPE } from './products/product-created.contract-event'
import { PRODUCT_UPDATED_IMAGE_URL_EVENT_CONTRACT_TYPE } from './products/product-updated-image-url.contract-event'
import { CUSTOMER_CREATED_EVENT_CONTRACT_TYPE } from './users/customer-created.contract-event'
import { EMPLOYEE_CREATED_EVENT_CONTRACT_TYPE } from './users/employee-created.contract-event'

export const EventContractType = {
  PRODUCT_CREATED: PRODUCT_CREATED_EVENT_CONTRACT_TYPE,
  PRODUCT_UPDATED_IMAGE_URL: PRODUCT_UPDATED_IMAGE_URL_EVENT_CONTRACT_TYPE,
  CUSTOMER_CREATED: CUSTOMER_CREATED_EVENT_CONTRACT_TYPE,
  EMPLOYEE_CREATED: EMPLOYEE_CREATED_EVENT_CONTRACT_TYPE
} as const

export type EventContractType = (typeof EventContractType)[keyof typeof EventContractType]

export type BaseEventContract<Payload = unknown> = {
  payload: Payload
  timestamp: string
  id: string
}

export function selectEventContractType(parameters: {
  eventContractType: string
}): Either<Error, { eventContractType: EventContractType }> {
  const contractType = Object.values(EventContractType).find((type) => type === parameters.eventContractType)
  if (contractType) return success({ eventContractType: contractType })
  return failure(new Error(`Unknown event contract type: ${parameters.eventContractType}`))
}

export function createEventContract<Payload>(parameters: {
  eventContractType: EventContractType
  payload: Payload
}): BaseEventContract<Payload> {
  return {
    payload: parameters.payload,
    timestamp: Date.now().toString(),
    id: parameters.eventContractType.replaceAll('.', '-') + '-' + crypto.randomUUID()
  }
}

import { type Either, failure, success } from '@niki/utils'

import { ORDER_CREATED_EVENT_CONTRACT_TYPE } from './orders/order-created.contract-event'
import { STOCK_AVAILABLE_EVENT_CONTRACT_TYPE } from './orders/stock-available.contract-event'
import { AWAITING_PAYMENT_EVENT_CONTRACT_TYPE } from './payments/awaiting-payment.contract-event'
import { PAYMENT_DONE_EVENT_CONTRACT_TYPE } from './payments/payment-done.contract-event'
import { PRODUCT_CREATED_EVENT_CONTRACT_TYPE } from './products/product-created.contract-event'
import { PRODUCT_UPDATED_IMAGE_URL_EVENT_CONTRACT_TYPE } from './products/product-updated-image-url.contract-event'
import { SHIPMENTS_DELIVERED_SHIPMENT_EVENT_CONTRACT_TYPE } from './shipments/delivered-shipment.contract-event'
import { SHIPMENTS_SHIPMENT_CREATED_EVENT_CONTRACT_TYPE } from './shipments/shipment-created.contract-event'
import { CUSTOMER_CREATED_EVENT_CONTRACT_TYPE } from './users/customer-created.contract-event'
import { EMPLOYEE_CREATED_EVENT_CONTRACT_TYPE } from './users/employee-created.contract-event'

export const EventContractType = {
  PRODUCT_CREATED: PRODUCT_CREATED_EVENT_CONTRACT_TYPE,
  PRODUCT_UPDATED_IMAGE_URL: PRODUCT_UPDATED_IMAGE_URL_EVENT_CONTRACT_TYPE,
  CUSTOMER_CREATED: CUSTOMER_CREATED_EVENT_CONTRACT_TYPE,
  EMPLOYEE_CREATED: EMPLOYEE_CREATED_EVENT_CONTRACT_TYPE,
  ORDER_CREATED: ORDER_CREATED_EVENT_CONTRACT_TYPE,
  STOCK_AVAILABLE: STOCK_AVAILABLE_EVENT_CONTRACT_TYPE,
  AWAITING_PAYMENT: AWAITING_PAYMENT_EVENT_CONTRACT_TYPE,
  PAYMENT_DONE: PAYMENT_DONE_EVENT_CONTRACT_TYPE,
  SHIPMENT_CREATED: SHIPMENTS_SHIPMENT_CREATED_EVENT_CONTRACT_TYPE,
  DELIVERED_SHIPMENT: SHIPMENTS_DELIVERED_SHIPMENT_EVENT_CONTRACT_TYPE
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

import { z } from 'zod'

import { type BaseEventContract } from '../_index'

export const PAYMENT_DONE_EVENT_CONTRACT_TYPE = 'payments.payment-done' as const

export type PaymentsPaymentDoneEventPayload = {
  orderID: string
  customerID: string
  amountInCents: number
  paymentMethod: string
  paymentAt: string
}
export type PaymentsPaymentDoneEvent = BaseEventContract<PaymentsPaymentDoneEventPayload>

export const paymentsPaymentDoneEventPayloadSchema = z.custom<PaymentsPaymentDoneEventPayload>()

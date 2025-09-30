import { z } from 'zod'

import { type BaseEventContract } from '../_index'

export const AWAITING_PAYMENT_EVENT_CONTRACT_TYPE = 'payments.awaiting-payment' as const

export type PaymentsAwaitingPaymentEventPayload = {
  orderID: string
  customerID: string
  paymentURL: string
  amountInCents: number
  paymentMethod: string
}
export type PaymentsAwaitingPaymentEvent = BaseEventContract<PaymentsAwaitingPaymentEventPayload>

export const paymentsAwaitingPaymentEventPayloadSchema = z.custom<PaymentsAwaitingPaymentEventPayload>()

import type { PaymentsPaymentDoneEventPayload } from '@niki/domain/src/contracts/events/payments/payment-done.contract-event'

import { makeProcessBillingUseCase } from '@factories/use-cases/billings/process-billing-use-case.factory'
import { type RouteHandler } from '@hono/zod-openapi'
import {
  EventContractType,
  getHttpStatusCodeByStatusError,
  getHttpStatusCodeByStatusSuccess,
  STATUS_ERROR,
  STATUS_SUCCESS
} from '@niki/domain'
import { paymentsServerENV } from '@niki/env'
import { makeLoggerProvider } from '@niki/logger'
import { ClientID, makeMessageBrokerProvider } from '@niki/message-broker'
import { WebhookErrorResponseSchema, type webhookRoute } from '@routes/abacate-pay/webhook.route'
import { WebhookSuccessResponseSchema } from '@routes/abacate-pay/webhook.route'

export const webhookController: RouteHandler<typeof webhookRoute> = async (c) => {
  const logger = makeLoggerProvider()
  try {
    const body = c.req.valid('json')

    const processBillingUseCase = makeProcessBillingUseCase()
    const result = await processBillingUseCase.execute({
      paymentGatewayBilling: { id: body.data.billing.id, status: body.data.billing.status }
    })

    if (result.isFailure()) {
      logger.sendLogError({
        message: 'Error processing billing',
        value: { error: result.value }
      })
      return c.json(
        WebhookErrorResponseSchema.parse({
          success: null,
          error: { name: result.value.name, message: result.value.errorMessage }
        }),
        getHttpStatusCodeByStatusError({ status: result.value.status }).statusCode as never
      )
    }

    makeMessageBrokerProvider({
      brokers: [paymentsServerENV.MESSAGE_BROKER_PROVIDER_BROKER_URL],
      clientID: ClientID.PAYMENTS_SERVER
    }).sendMessage<PaymentsPaymentDoneEventPayload>({
      eventContractType: EventContractType.PAYMENT_DONE,
      payload: {
        orderID: result.value.billingUpdated.order.id.value,
        customerID: result.value.billingUpdated.customer.id.value,
        amountInCents: result.value.billingUpdated.amountInCents,
        paymentMethod: result.value.billingUpdated.paymentMethod,
        paymentAt: result.value.billingUpdated.paymentAt.toString()
      }
    })

    return c.json(
      WebhookSuccessResponseSchema.parse({
        success: { data: result.value.billingUpdated, message: 'Webhook processed successfully' },
        error: null
      }),
      getHttpStatusCodeByStatusSuccess({ status: STATUS_SUCCESS.DONE }).statusCode as never
    )
  } catch (error: unknown) {
    logger.sendLogError({
      message: 'Unexpected error in webhookController',
      value: { error: error }
    })
    return c.json(
      WebhookErrorResponseSchema.parse({
        success: null,
        error: { name: 'InternalServerError', message: 'An unexpected error occurred while processing the webhook' }
      }),
      getHttpStatusCodeByStatusError({ status: STATUS_ERROR.INTERNAL_ERROR }).statusCode as never
    )
  }
}

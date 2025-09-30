import { makeCreateBillingUseCase } from '@factories/use-cases/billings/create-billing-use-case.factory'
import {
  EventContractType,
  type OrdersStockAvailableEventPayload,
  type PaymentsAwaitingPaymentEventPayload
} from '@niki/domain'
import { paymentsServerENV } from '@niki/env'
import { makeLoggerProvider } from '@niki/logger'
import { ClientID, makeMessageBrokerProvider } from '@niki/message-broker'
import { type HandlerMessageBroker } from '@niki/message-broker/src/kafka-message-broker.provider'

export const handleStockAvailability: HandlerMessageBroker<OrdersStockAvailableEventPayload> = async (parameters) => {
  const resultCreateBilling = await makeCreateBillingUseCase().execute({
    order: {
      id: parameters.payload.orderID,
      totalAmountInCents: parameters.payload.products.reduce(
        (acc, product) => acc + product.priceInCents * product.quantity,
        0
      )
    }
  })

  if (resultCreateBilling.isFailure()) {
    makeLoggerProvider().sendLogError({
      message: '❌ Failed to create billing after stock available',
      value: { error: resultCreateBilling.value }
    })
    return
  }

  makeLoggerProvider().sendLogInfo({ message: resultCreateBilling.value.message })

  const { billingCreated } = resultCreateBilling.value

  makeMessageBrokerProvider({
    brokers: [paymentsServerENV.MESSAGE_BROKER_PROVIDER_BROKER_URL],
    clientID: ClientID.PAYMENTS_SERVER
  }).sendMessage<PaymentsAwaitingPaymentEventPayload>({
    eventContractType: EventContractType.AWAITING_PAYMENT,
    payload: {
      orderID: billingCreated.order.id.value,
      paymentURL: billingCreated.paymentURL ?? '',
      amountInCents: billingCreated.amountInCents,
      paymentMethod: billingCreated.paymentMethod,
      customerID: billingCreated.customer.id.value
    }
  })
}

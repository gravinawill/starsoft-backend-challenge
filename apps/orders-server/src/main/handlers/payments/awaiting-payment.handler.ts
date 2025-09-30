import { makeUpdateOrderAfterAwaitingPaymentUseCase } from '@factories/use-cases/orders/update-order-after-awaiting-payment-use-case.factory'
import { type PaymentsAwaitingPaymentEventPayload } from '@niki/domain/src/contracts/events/payments/awaiting-payment.contract-event'
import { makeLoggerProvider } from '@niki/logger'
import { type HandlerMessageBroker } from '@niki/message-broker/src/kafka-message-broker.provider'

export const handleAwaitingPayment: HandlerMessageBroker<PaymentsAwaitingPaymentEventPayload> = async ({ payload }) => {
  const resultUpdateOrderAfterAwaitingPayment = await makeUpdateOrderAfterAwaitingPaymentUseCase().execute({
    orderAwaitingPayment: { orderID: payload.orderID }
  })
  if (resultUpdateOrderAfterAwaitingPayment.isFailure()) {
    makeLoggerProvider().sendLogError({
      message: '❌ Failed to update order after awaiting payment',
      value: { error: resultUpdateOrderAfterAwaitingPayment.value }
    })
  } else {
    makeLoggerProvider().sendLogInfo({ message: resultUpdateOrderAfterAwaitingPayment.value.message })
  }
}

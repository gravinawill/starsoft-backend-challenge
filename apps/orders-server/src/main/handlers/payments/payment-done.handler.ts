import { makeUpdateOrderAfterPaymentDoneUseCase } from '@factories/use-cases/orders/update-order-after-payment-done-use-case.factory'
import { type PaymentsPaymentDoneEventPayload } from '@niki/domain/src/contracts/events/payments/payment-done.contract-event'
import { makeLoggerProvider } from '@niki/logger'
import { type HandlerMessageBroker } from '@niki/message-broker/src/kafka-message-broker.provider'

export const handlePaymentDone: HandlerMessageBroker<PaymentsPaymentDoneEventPayload> = async ({ payload }) => {
  const resultUpdateOrderAfterPaymentDone = await makeUpdateOrderAfterPaymentDoneUseCase().execute({
    orderPaymentDone: { orderID: payload.orderID }
  })
  if (resultUpdateOrderAfterPaymentDone.isFailure()) {
    makeLoggerProvider().sendLogError({
      message: '❌ Failed to update order after payment done',
      value: { error: resultUpdateOrderAfterPaymentDone.value }
    })
  } else {
    makeLoggerProvider().sendLogInfo({ message: resultUpdateOrderAfterPaymentDone.value.message })
  }
}

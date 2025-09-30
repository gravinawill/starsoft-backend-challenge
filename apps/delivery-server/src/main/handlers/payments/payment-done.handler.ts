import { EventContractType, type ShipmentsShipmentCreatedEventPayload } from '@niki/domain'
import { type PaymentsPaymentDoneEventPayload } from '@niki/domain/src/contracts/events/payments/payment-done.contract-event'
import { deliveryServerENV } from '@niki/env'
import { makeLoggerProvider } from '@niki/logger'
import { ClientID, makeMessageBrokerProvider } from '@niki/message-broker'
import { type HandlerMessageBroker } from '@niki/message-broker/src/kafka-message-broker.provider'

import { makeCreateShipmentUseCase } from '../../factories/use-cases/shipments/create-shipment-use-case.factory'

export const handlePaymentDone: HandlerMessageBroker<PaymentsPaymentDoneEventPayload> = async ({ payload }) => {
  const createShipmentResult = await makeCreateShipmentUseCase().execute({
    payload: {
      orderID: payload.orderID,
      customerID: payload.customerID,
      amountInCents: payload.amountInCents,
      paymentMethod: payload.paymentMethod,
      paymentAt: payload.paymentAt
    }
  })

  if (createShipmentResult.isFailure()) {
    makeLoggerProvider().sendLogError({
      message: '❌ Failed to create shipment after payment done',
      value: { error: createShipmentResult.value }
    })
    return
  }

  makeLoggerProvider().sendLogInfo({
    message: createShipmentResult.value.message
  })
  const { shipmentCreated } = createShipmentResult.value
  await makeMessageBrokerProvider({
    brokers: [deliveryServerENV.MESSAGE_BROKER_PROVIDER_BROKER_URL],
    clientID: ClientID.DELIVERY_SERVER
  }).sendMessage<ShipmentsShipmentCreatedEventPayload>({
    eventContractType: EventContractType.SHIPMENT_CREATED,
    payload: { orderID: shipmentCreated.order.id.value, customerID: shipmentCreated.customer.id.value }
  })
}

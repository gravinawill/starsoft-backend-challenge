import { makeUpdateOrderAfterDeliveredShipmentUseCase } from '@factories/use-cases/orders/update-order-after-delivered-shipment-use-case.factory'
import { type ShipmentsDeliveredShipmentEventPayload } from '@niki/domain'
import { makeLoggerProvider } from '@niki/logger'
import { type HandlerMessageBroker } from '@niki/message-broker/src/kafka-message-broker.provider'

export const handleDeliveredShipment: HandlerMessageBroker<ShipmentsDeliveredShipmentEventPayload> = async ({
  payload
}) => {
  const resultUpdateOrderAfterDeliveredShipment = await makeUpdateOrderAfterDeliveredShipmentUseCase().execute({
    orderDelivered: { orderID: payload.orderID }
  })
  if (resultUpdateOrderAfterDeliveredShipment.isFailure()) {
    makeLoggerProvider().sendLogError({
      message: '❌ Failed to update order after delivered shipment',
      value: { error: resultUpdateOrderAfterDeliveredShipment.value }
    })
    throw new Error(resultUpdateOrderAfterDeliveredShipment.value.errorMessage)
  }
  makeLoggerProvider().sendLogInfo({ message: resultUpdateOrderAfterDeliveredShipment.value.message })
}

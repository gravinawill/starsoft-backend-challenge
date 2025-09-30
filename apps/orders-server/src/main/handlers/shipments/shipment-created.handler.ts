import { makeUpdateOrderAfterDeliveredShipmentUseCase } from '@factories/use-cases/orders/update-order-after-delivered-shipment-use-case.factory'
import { type ShipmentsDeliveredShipmentEventPayload } from '@niki/domain'
import { makeLoggerProvider } from '@niki/logger'
import { type HandlerMessageBroker } from '@niki/message-broker/src/kafka-message-broker.provider'

export const handleDeliveredShipment: HandlerMessageBroker<ShipmentsDeliveredShipmentEventPayload> = async ({
  payload
}) => {
  const useCase = makeUpdateOrderAfterDeliveredShipmentUseCase()
  const result = await useCase.execute({
    orderDelivered: { orderID: payload.orderID }
  })

  if (result.isFailure()) {
    makeLoggerProvider().sendLogError({
      message: '❌ Failed to update order after delivered shipment',
      value: { error: result.value }
    })
    throw new Error(result.value.errorMessage)
  }

  makeLoggerProvider().sendLogInfo({ message: result.value.message })
}

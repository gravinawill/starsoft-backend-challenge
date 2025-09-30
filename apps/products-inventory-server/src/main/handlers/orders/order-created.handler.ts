import { makeCreateOrderByEventUseCase } from '@factories/use-cases/orders/create-order-by-event-use-case.factory'
import { makeVerifyStockAvailabilityUseCase } from '@factories/use-cases/products/verify-stock-availability-use-case.factory'
import {
  EventContractType,
  type OrdersOrderCreatedEventPayload,
  type OrdersStockAvailableEventPayload
} from '@niki/domain'
import { productsInventoryServerENV } from '@niki/env'
import { makeLoggerProvider } from '@niki/logger'
import { ClientID, makeMessageBrokerProvider } from '@niki/message-broker'

export async function handleOrderCreated(parameters: { payload: OrdersOrderCreatedEventPayload }): Promise<void> {
  const logger = makeLoggerProvider()

  const resultCreateOrder = await makeCreateOrderByEventUseCase().execute({ payload: parameters.payload })
  if (resultCreateOrder.isFailure()) {
    logger.sendLogError({
      message: '❌ Failed to create order',
      value: { error: resultCreateOrder.value }
    })
    return
  }

  const { orderCreated, message } = resultCreateOrder.value
  logger.sendLogInfo({ message })

  const resultVerifyStockAvailability = await makeVerifyStockAvailabilityUseCase().execute({ order: orderCreated })
  if (resultVerifyStockAvailability.isFailure()) {
    logger.sendLogError({
      message: '❌ Failed to verify stock availability',
      value: { error: resultVerifyStockAvailability.value }
    })
    return
  }

  const { orderConfirmed, message: messageVerifyStockAvailability } = resultVerifyStockAvailability.value
  logger.sendLogInfo({ message: messageVerifyStockAvailability })

  await makeMessageBrokerProvider({
    brokers: [productsInventoryServerENV.MESSAGE_BROKER_PROVIDER_BROKER_URL],
    clientID: ClientID.PRODUCTS_INVENTORY_SERVER
  }).sendMessage<OrdersStockAvailableEventPayload>({
    eventContractType: EventContractType.STOCK_AVAILABLE,
    payload: {
      createdAt: orderConfirmed.createdAt,
      updatedAt: orderConfirmed.updatedAt,
      orderID: orderConfirmed.id.value,
      customerID: parameters.payload.customerID,
      products: orderConfirmed.orderProductReservation.map((p) => ({
        id: p.product.id.value,
        quantity: p.quantity,
        priceInCents: p.pricePerUnitInCents
      }))
    }
  })
}

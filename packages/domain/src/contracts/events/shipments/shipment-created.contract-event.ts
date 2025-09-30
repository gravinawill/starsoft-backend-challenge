import { z } from 'zod'

import { type BaseEventContract } from '../_index'

export const SHIPMENTS_SHIPMENT_CREATED_EVENT_CONTRACT_TYPE = 'shipments.shipment-created' as const

export type ShipmentsShipmentCreatedEventPayload = {
  orderID: string
  customerID: string
}

export type ShipmentsShipmentCreatedEvent = BaseEventContract<ShipmentsShipmentCreatedEventPayload>

export const shipmentsShipmentCreatedEventPayloadSchema = z.custom<ShipmentsShipmentCreatedEventPayload>()

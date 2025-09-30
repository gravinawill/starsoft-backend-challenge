import { z } from 'zod'

import { type BaseEventContract } from '../_index'

export const SHIPMENTS_DELIVERED_SHIPMENT_EVENT_CONTRACT_TYPE = 'shipments.delivered-shipment' as const

export type ShipmentsDeliveredShipmentEventPayload = {
  shipmentID: string
  orderID: string
  customerID: string
  deliveredAt: Date
}
export type ShipmentsDeliveredShipmentEvent = BaseEventContract<ShipmentsDeliveredShipmentEventPayload>

export const shipmentsDeliveredShipmentEventPayloadSchema = z.custom<ShipmentsDeliveredShipmentEventPayload>()

import { Database } from '@infra/database/database'
import { ShipmentsPrismaRepository } from '@infra/database/repositories/shipments.prisma-repository'
import { makeLoggerProvider } from '@niki/logger'
import { type IFindShipmentByIDShipmentsRepository } from '@repository-contracts/shipments/find-shipment-by-id.shipments-repository'
import { type ISaveShipmentsRepository } from '@repository-contracts/shipments/save.shipments-repository'
import { type IUpdateShipmentShipmentsRepository } from '@repository-contracts/shipments/update-shipment.shipments-repository'

export const makeShipmentsRepository = (): ISaveShipmentsRepository &
  IFindShipmentByIDShipmentsRepository &
  IUpdateShipmentShipmentsRepository => new ShipmentsPrismaRepository(makeLoggerProvider(), Database.getInstance())

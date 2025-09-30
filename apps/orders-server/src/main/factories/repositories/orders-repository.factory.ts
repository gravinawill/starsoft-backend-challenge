import { Database } from '@infra/database/database'
import { OrdersPrismaRepository } from '@infra/database/repositories/orders.prisma-repository'
import { SearchOrdersElasticsearchRepository } from '@infra/elasticsearch/search-orders.elasticsearch-repository'
import { makeLoggerProvider } from '@niki/logger'
import { type ISaveOrdersRepository } from '@repository-contracts/orders/save.orders-repository'
import { type ISearchOrdersRepository } from '@repository-contracts/orders/search.orders-repository'
import { type IUpdateOrderAfterAwaitingPaymentOrdersRepository } from '@repository-contracts/orders/update-order-after-awaiting-payment.orders-repository'
import { type IUpdateOrderAfterDeliveryCompletedOrdersRepository } from '@repository-contracts/orders/update-order-after-delivery-completed.orders-repository'
import { type IUpdateOrderAfterPaymentDoneOrdersRepository } from '@repository-contracts/orders/update-order-after-payment-done.orders-repository'
import { type IUpdateOrderAfterShipmentCreatedOrdersRepository } from '@repository-contracts/orders/update-order-after-shipment-created.orders-repository'
import { type IUpdateOrderAfterStockAvailableOrdersRepository } from '@repository-contracts/orders/update-order-after-stock-available.orders-repository'
import { type IValidateIDOrdersRepository } from '@repository-contracts/orders/validate-id.orders-repository'

export const makeOrdersRepository = (): ISaveOrdersRepository &
  IUpdateOrderAfterStockAvailableOrdersRepository &
  IUpdateOrderAfterAwaitingPaymentOrdersRepository &
  IValidateIDOrdersRepository &
  IUpdateOrderAfterPaymentDoneOrdersRepository &
  IUpdateOrderAfterDeliveryCompletedOrdersRepository &
  IUpdateOrderAfterShipmentCreatedOrdersRepository =>
  new OrdersPrismaRepository(makeLoggerProvider(), Database.getInstance())

export const makeSearchOrdersRepository = (): ISearchOrdersRepository =>
  new SearchOrdersElasticsearchRepository(makeLoggerProvider())

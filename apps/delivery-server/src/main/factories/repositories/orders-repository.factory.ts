import { Database } from '@infra/database/database'
import { OrdersPrismaRepository } from '@infra/database/repositories/orders.prisma-repository'
import { makeLoggerProvider } from '@niki/logger'
import { type ISaveOrdersRepository } from '@repository-contracts/orders/save.orders-repository'
import { type IValidateIDOrdersRepository } from '@repository-contracts/orders/validate-id.orders-repository'

export const makeOrdersRepository = (): ISaveOrdersRepository & IValidateIDOrdersRepository =>
  new OrdersPrismaRepository(makeLoggerProvider(), Database.getInstance())

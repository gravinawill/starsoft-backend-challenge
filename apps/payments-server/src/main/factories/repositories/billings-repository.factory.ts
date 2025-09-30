import type { IFindBillingByExternalIDBillingsRepository } from '@repository-contracts/billings/find-billing-by-external-id.billings-repository'
import type { IUpdateStatusAndUpdateOrderBillingsRepository } from '@repository-contracts/billings/update-status-and-update-order.billings-repository'

import { Database } from '@infra/database/database'
import { BillingsPrismaRepository } from '@infra/database/repositories/billings.prisma-repository'
import { makeLoggerProvider } from '@niki/logger'
import { type IFindBillingByOrderBillingsRepository } from '@repository-contracts/billings/find-billing-by-order.billings-repository'
import { type ISaveAndUpdateOrderBillingsRepository } from '@repository-contracts/billings/save-and-update-order.billings-repository'

export const makeBillingsRepository = (): ISaveAndUpdateOrderBillingsRepository &
  IFindBillingByOrderBillingsRepository &
  IFindBillingByExternalIDBillingsRepository &
  IUpdateStatusAndUpdateOrderBillingsRepository =>
  new BillingsPrismaRepository(makeLoggerProvider(), Database.getInstance())

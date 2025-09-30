import { Database } from '@infra-database/database'
import { ProductsPrismaRepository } from '@infra-database/repositories/products.prisma-repository'
import { makeLoggerProvider } from '@niki/logger'
import { type IFindAndUpdateAvailabilityProductsRepository } from '@repository-contracts/products/find-and-update-availability.products-repository'
import { type ISaveProductsRepository } from '@repository-contracts/products/save.products-repository'
import { type IValidateIDProductsRepository } from '@repository-contracts/products/validate-id.products-repository'
import { type IValidateIDsProductsRepository } from '@repository-contracts/products/validate-ids.products-repository'

export const makeProductsRepository = (): ISaveProductsRepository &
  IValidateIDProductsRepository &
  IValidateIDsProductsRepository &
  IFindAndUpdateAvailabilityProductsRepository =>
  new ProductsPrismaRepository(makeLoggerProvider(), Database.getInstance())

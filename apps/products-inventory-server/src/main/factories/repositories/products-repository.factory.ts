import { Database } from '@infra-database/database'
import { ProductsPrismaRepository } from '@infra-database/repositories/products.prisma-repository'
import { makeLoggerProvider } from '@niki/logger'
import { type ISaveProductsRepository } from '@repository-contracts/products/save.products-repository'
import { type IValidateIDProductsRepository } from '@repository-contracts/products/validate-id.products-repository'

export const makeProductsRepository = (): ISaveProductsRepository & IValidateIDProductsRepository =>
  new ProductsPrismaRepository(makeLoggerProvider(), Database.getInstance())

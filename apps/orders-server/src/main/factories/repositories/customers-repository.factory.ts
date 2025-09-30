import { Database } from '@infra/database/database'
import { CustomersPrismaRepository } from '@infra/database/repositories/customers.prisma-repository'
import { makeLoggerProvider } from '@niki/logger'
import { type ISaveCustomersRepository } from '@repository-contracts/customers/save.customers-repository'
import { type IValidateIDCustomersRepository } from '@repository-contracts/customers/validate-id.customers-repository'

export const makeCustomersRepository = (): ISaveCustomersRepository & IValidateIDCustomersRepository =>
  new CustomersPrismaRepository(makeLoggerProvider(), Database.getInstance())

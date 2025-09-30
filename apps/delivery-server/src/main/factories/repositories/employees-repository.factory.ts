import { Database } from '@infra/database/database'
import { EmployeesPrismaRepository } from '@infra/database/repositories/employees.prisma-repository'
import { makeLoggerProvider } from '@niki/logger'
import { type ISaveEmployeesRepository } from '@repository-contracts/employees/save.employees-repository'
import { type IValidateIDEmployeesRepository } from '@repository-contracts/employees/validate-id.employees-repository'

export const makeEmployeesRepository = (): ISaveEmployeesRepository & IValidateIDEmployeesRepository =>
  new EmployeesPrismaRepository(makeLoggerProvider(), Database.getInstance())

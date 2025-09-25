import { UsersDrizzleRepository } from '@infra/database/drizzle/repositories/users.drizzle-repository'
import { makeLoggerProvider } from '@niki/logger'
import { type ISaveUsersRepository } from '@repository-contracts/users/save.users-repository'
import { type IValidateEmailUsersRepository } from '@repository-contracts/users/validate-email.users-repository'

export const makeUsersRepository = (): IValidateEmailUsersRepository & ISaveUsersRepository =>
  new UsersDrizzleRepository(makeLoggerProvider())

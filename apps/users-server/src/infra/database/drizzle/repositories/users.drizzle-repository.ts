import { ModelName } from '@niki/domain'
import { Email, ID, type ISendLogErrorLoggerProvider, Password, RepositoryError } from '@niki/domain'
import { failure, success } from '@niki/utils'
import {
  type ISaveUsersRepository,
  type SaveUsersRepositoryDTO
} from '@repository-contracts/users/save.users-repository'
import {
  type IValidateEmailUsersRepository,
  type ValidateEmailUsersRepositoryDTO
} from '@repository-contracts/users/validate-email.users-repository'
import { and, eq, isNull } from 'drizzle-orm'

import { db } from '../db'
import { schema } from '../schema'

// Repository constants
enum RepositoryNames {
  USERS = 'users'
}

enum UsersRepositoryMethods {
  SAVE = 'save',
  VALIDATE_EMAIL = 'validate email'
}

export class UsersDrizzleRepository implements IValidateEmailUsersRepository, ISaveUsersRepository {
  constructor(private readonly loggerProvider: ISendLogErrorLoggerProvider) {}

  public async validateEmail(
    parameters: ValidateEmailUsersRepositoryDTO.Parameters
  ): ValidateEmailUsersRepositoryDTO.Result {
    try {
      const { user } = parameters
      const foundUser = await db
        .select({
          id: schema.users.id,
          email: schema.users.email,
          password: schema.users.password
        })
        .from(schema.users)
        .where(and(eq(schema.users.email, user.email.value), isNull(schema.users.deletedAt)))
        .limit(1)
      if (foundUser.length === 0) return success({ foundUser: null })
      const userRecord = foundUser[0]!
      const resultValidateUserID = ID.validate({ id: userRecord.id, modelName: ModelName.USER })
      if (resultValidateUserID.isFailure()) {
        const repositoryError = new RepositoryError({
          error: resultValidateUserID.value,
          repository: {
            method: UsersRepositoryMethods.VALIDATE_EMAIL,
            name: RepositoryNames.USERS,
            externalName: 'drizzle'
          }
        })
        this.loggerProvider.sendLogError({
          message: repositoryError.errorMessage,
          value: repositoryError
        })
        return failure(repositoryError)
      }
      const resultValidateEmail = Email.validateEmail({ email: userRecord.email, isVerified: false })
      if (resultValidateEmail.isFailure()) {
        const repositoryError = new RepositoryError({
          error: resultValidateEmail.value,
          repository: {
            method: UsersRepositoryMethods.VALIDATE_EMAIL,
            name: RepositoryNames.USERS,
            externalName: 'drizzle'
          }
        })
        this.loggerProvider.sendLogError({
          message: repositoryError.errorMessage,
          value: repositoryError
        })
        return failure(repositoryError)
      }
      const password = new Password({ password: userRecord.password, isEncrypted: true })
      return success({
        foundUser: {
          id: resultValidateUserID.value.idValidated,
          email: resultValidateEmail.value.emailValidated,
          password
        }
      })
    } catch (error: unknown) {
      const repositoryError = new RepositoryError({
        error,
        repository: {
          method: UsersRepositoryMethods.VALIDATE_EMAIL,
          name: RepositoryNames.USERS,
          externalName: 'drizzle'
        }
      })
      this.loggerProvider.sendLogError({
        message: repositoryError.errorMessage,
        value: repositoryError
      })
      return failure(repositoryError)
    }
  }

  public async save(parameters: SaveUsersRepositoryDTO.Parameters): SaveUsersRepositoryDTO.Result {
    try {
      await db.insert(schema.users).values({
        id: parameters.user.id.value,
        name: parameters.user.name,
        email: parameters.user.email.value,
        password: parameters.user.password.value,
        role: parameters.user.role,
        createdAt: parameters.user.createdAt,
        updatedAt: parameters.user.updatedAt,
        deletedAt: parameters.user.deletedAt
      })
      return success(null)
    } catch (error: unknown) {
      const repositoryError = new RepositoryError({
        error,
        repository: {
          method: UsersRepositoryMethods.SAVE,
          name: RepositoryNames.USERS,
          externalName: 'drizzle'
        }
      })
      this.loggerProvider.sendLogError({
        message: repositoryError.errorMessage,
        value: repositoryError
      })
      return failure(repositoryError)
    }
  }
}

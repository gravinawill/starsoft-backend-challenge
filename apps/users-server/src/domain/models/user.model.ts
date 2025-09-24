import { InvalidUserNameError, InvalidUserRoleError } from '@errors/index'
import { type Email, type GenerateIDError, ID, type Password } from '@niki/domain'
import { type Either, failure, success } from '@niki/utils'

import { ModelName } from './_model-name'

export enum UserRole {
  CUSTOMER = 'customer',
  EMPLOYEE = 'employee'
}

export class User {
  public readonly id: ID
  public name: string
  public email: Email
  public password: Password
  public role: UserRole
  public readonly createdAt: Date
  public updatedAt: Date
  public deletedAt: Date | null

  private constructor(parameters: {
    id: ID
    name: string
    email: Email
    password: Password
    role: UserRole
    createdAt: Date
    updatedAt: Date
    deletedAt: Date | null
  }) {
    this.id = parameters.id
    this.name = parameters.name
    this.email = parameters.email
    this.password = parameters.password
    this.role = parameters.role
    this.createdAt = parameters.createdAt
    this.updatedAt = parameters.updatedAt
    this.deletedAt = parameters.deletedAt
  }

  public static create(parameters: {
    name: string
    email: Email
    password: Password
    role: UserRole
  }): Either<GenerateIDError, { userCreated: User }> {
    const resultGenerateID = ID.generate({ modelName: ModelName.USER })
    if (resultGenerateID.isFailure()) return failure(resultGenerateID.value)
    const { idGenerated: userID } = resultGenerateID.value

    const now = new Date()

    return success({
      userCreated: new User({
        id: userID,
        name: parameters.name,
        email: parameters.email,
        password: parameters.password,
        role: parameters.role,
        createdAt: now,
        updatedAt: now,
        deletedAt: null
      })
    })
  }

  public static validateName(parameters: {
    name: string
    userID: ID | null
  }): Either<InvalidUserNameError, { nameValidated: string }> {
    if (parameters.name.length < 3) {
      return failure(new InvalidUserNameError({ name: parameters.name, userID: parameters.userID }))
    }
    return success({ nameValidated: parameters.name })
  }

  public static validateRole(parameters: {
    role: string
    user: Pick<User, 'id'> | null
  }): Either<InvalidUserRoleError, { roleValidated: UserRole }> {
    const roleMap = new Map<string, UserRole>()
    for (const role of Object.values(UserRole)) {
      roleMap.set(role.toLowerCase(), role)
    }
    const lowercasedRole = parameters.role.toLowerCase()
    const mappedRole = roleMap.get(lowercasedRole)
    if (mappedRole === undefined) {
      return failure(
        new InvalidUserRoleError({
          role: lowercasedRole,
          userID: parameters.user?.id ?? null
        })
      )
    }
    return success({ roleValidated: mappedRole })
  }
}

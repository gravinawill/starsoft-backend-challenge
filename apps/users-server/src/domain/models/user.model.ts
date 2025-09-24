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
  public avatarUrl: string | null
  public roles: UserRole[]
  public readonly createdAt: Date
  public updatedAt: Date
  public deletedAt: Date | null

  private constructor(parameters: {
    id: ID
    name: string
    email: Email
    password: Password
    avatarUrl: string | null
    roles: UserRole[]
    createdAt: Date
    updatedAt: Date
    deletedAt: Date | null
  }) {
    this.id = parameters.id
    this.name = parameters.name
    this.email = parameters.email
    this.password = parameters.password
    this.avatarUrl = parameters.avatarUrl
    this.roles = parameters.roles
    this.createdAt = parameters.createdAt
    this.updatedAt = parameters.updatedAt
    this.deletedAt = parameters.deletedAt
  }

  public static create(parameters: {
    name: string
    email: Email
    password: Password
    roles: UserRole[]
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
        avatarUrl: null,
        roles: parameters.roles,
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

  public static validateRoles(parameters: {
    roles: string[]
    user: Pick<User, 'id'> | null
  }): Either<InvalidUserRoleError, { rolesValidated: UserRole[] }> {
    const validRoles = Object.values(UserRole).map((role) => role.toLowerCase())
    const inputRoles = parameters.roles.map((role) => role.toLowerCase())

    const rolesValidated: UserRole[] = []

    for (const inputRole of inputRoles) {
      const matchedIndex = validRoles.indexOf(inputRole)
      if (matchedIndex === -1) {
        return failure(
          new InvalidUserRoleError({
            role: inputRole,
            userID: parameters.user?.id ?? null
          })
        )
      }
      rolesValidated.push(Object.values(UserRole)[matchedIndex]!)
    }

    return success({ rolesValidated })
  }
}

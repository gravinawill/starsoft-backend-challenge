import { type ID, StatusError } from '@niki/domain'

export class InvalidUserRoleError {
  public readonly errorMessage: string
  public readonly errorValue: unknown
  public readonly name: 'InvalidUserRoleError'
  public readonly status: StatusError

  constructor(parameters: { role: string; userID: ID | null }) {
    this.errorMessage =
      `Invalid user role: "${parameters.role}".` +
      (parameters.userID ? ` (User ID: ${parameters.userID.value})` : ' (No User ID provided)')
    this.errorValue = undefined
    this.name = 'InvalidUserRoleError'
    this.status = StatusError.INVALID
  }
}

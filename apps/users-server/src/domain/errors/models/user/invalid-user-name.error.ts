import { type ID, StatusError } from '@niki/domain'

export class InvalidUserNameError {
  public readonly errorMessage: string
  public readonly errorValue: unknown
  public readonly name: 'InvalidUserNameError'
  public readonly status: StatusError

  constructor(parameters: { name: string; userID: ID | null }) {
    this.errorMessage =
      `Invalid user name: "${parameters.name}"` + (parameters.userID ? ` (User ID: ${parameters.userID.value})` : '')
    this.errorValue = undefined
    this.name = 'InvalidUserNameError'
    this.status = StatusError.INVALID
  }
}

import { STATUS_ERROR } from '../../../shared/status-error'
import { type ID } from '../../../value-objects/id.value-object'

export class InvalidUserNameError {
  public readonly errorMessage: string
  public readonly errorValue: unknown
  public readonly name: 'InvalidUserNameError'
  public readonly status: STATUS_ERROR

  constructor(parameters: { name: string; userID: ID | null }) {
    this.errorMessage =
      `Invalid user name: "${parameters.name}"` + (parameters.userID ? ` (User ID: ${parameters.userID.value})` : '')
    this.errorValue = undefined
    this.name = 'InvalidUserNameError'
    this.status = STATUS_ERROR.INVALID
  }
}

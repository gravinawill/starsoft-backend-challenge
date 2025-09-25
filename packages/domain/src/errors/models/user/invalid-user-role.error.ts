import { STATUS_ERROR } from '../../../shared/status-error'
import { type ID } from '../../../value-objects/id.value-object'

export class InvalidUserRoleError {
  public readonly errorMessage: string
  public readonly errorValue: unknown
  public readonly name: 'InvalidUserRoleError'
  public readonly status: STATUS_ERROR

  constructor(parameters: { role: string; userID: ID | null }) {
    this.errorMessage =
      `Invalid user role: "${parameters.role}".` +
      (parameters.userID ? ` (User ID: ${parameters.userID.value})` : ' (No User ID provided)')
    this.errorValue = undefined
    this.name = 'InvalidUserRoleError'
    this.status = STATUS_ERROR.INVALID
  }
}

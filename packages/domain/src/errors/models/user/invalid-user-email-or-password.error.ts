import { STATUS_ERROR } from '../../../shared/status-error'
import { type Email } from '../../../value-objects/email.value-object'

export class InvalidUserEmailOrPasswordError {
  public readonly errorMessage: string
  public readonly errorValue: unknown
  public readonly name: 'InvalidUserEmailOrPasswordError'
  public readonly status: STATUS_ERROR

  constructor(parameters: { email: Email }) {
    this.errorMessage = `The email or password provided is incorrect. Please check your credentials and try again.`
    this.errorValue = { email: parameters.email }
    this.name = 'InvalidUserEmailOrPasswordError'
    this.status = STATUS_ERROR.INVALID
  }
}

import { STATUS_ERROR } from '../../../shared/status-error'
import { type Email } from '../../../value-objects/email.value-object'

export class EmailAlreadyInUseError {
  public readonly status: STATUS_ERROR
  public readonly errorMessage: string
  public readonly name = 'EmailAlreadyInUseError'
  public readonly errorValue: unknown

  constructor(parameters: { email: Pick<Email, 'value'> }) {
    this.errorMessage = `The email "${parameters.email.value}" is already in use. Please use a different email address.`
    this.status = STATUS_ERROR.CONFLICT
    this.errorValue = null
  }
}

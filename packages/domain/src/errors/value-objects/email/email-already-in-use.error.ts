import { StatusError } from '../../../shared/status-error'
import { type Email } from '../../../value-objects/email.value-object'

export class EmailAlreadyInUseError {
  public readonly status: StatusError
  public readonly errorMessage: string
  public readonly name = 'EmailAlreadyInUseError'
  public readonly errorValue: unknown

  constructor(parameters: { email: Pick<Email, 'value'> }) {
    this.errorMessage = `The email "${parameters.email.value}" is already in use. Please use a different email address.`
    this.status = StatusError.CONFLICT
    this.errorValue = null
  }
}

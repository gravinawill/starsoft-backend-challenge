import { StatusError } from '../../../shared/status-error'

export class InvalidEmailError {
  public readonly status: StatusError
  public readonly errorMessage: string
  public readonly name: 'InvalidEmailError'
  public readonly errorValue: unknown

  constructor(parameters: { email: string }) {
    this.errorMessage = `The email ${parameters.email} is invalid`
    this.errorValue = { email: parameters.email }
    this.name = 'InvalidEmailError'
    this.status = StatusError.INVALID
  }
}

import { StatusError } from '../../../shared/status-error'

export class InvalidPasswordFormatError {
  public readonly status: StatusError
  public readonly errorMessage: string
  public readonly name: 'InvalidPasswordFormatError'
  public readonly errorValue: unknown

  constructor() {
    this.errorMessage = `The password is invalid format`
    this.errorValue = null
    this.name = 'InvalidPasswordFormatError'
    this.status = StatusError.INVALID
  }
}

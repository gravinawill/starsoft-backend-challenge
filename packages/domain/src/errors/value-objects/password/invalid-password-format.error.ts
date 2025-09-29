import { STATUS_ERROR } from '../../../shared/status-error'

export class InvalidPasswordFormatError {
  public readonly status: STATUS_ERROR
  public readonly errorMessage: string
  public readonly name: 'InvalidPasswordFormatError'
  public readonly errorValue: unknown

  constructor() {
    this.errorMessage = `The password is invalid format`
    this.errorValue = null
    this.name = 'InvalidPasswordFormatError'
    this.status = STATUS_ERROR.INVALID
  }
}

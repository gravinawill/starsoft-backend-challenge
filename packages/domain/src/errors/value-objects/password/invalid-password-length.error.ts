import { STATUS_ERROR } from '../../../shared/status-error'

export class InvalidPasswordLengthError {
  public readonly status: STATUS_ERROR
  public readonly errorMessage: string
  public readonly name: 'InvalidPasswordLengthError'
  public readonly errorValue: unknown

  constructor(parameters: { passwordLength: number }) {
    this.errorMessage = `Invalid password length: ${parameters.passwordLength}`
    this.errorValue = null
    this.name = 'InvalidPasswordLengthError'
    this.status = STATUS_ERROR.INVALID
  }
}

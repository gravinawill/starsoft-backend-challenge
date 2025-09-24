import { StatusError } from '../../../shared/status-error'

export class InvalidPasswordFormatError {
  public readonly status: StatusError
  public readonly errorMessage: string
  public readonly name: 'InvalidPasswordFormatError'
  public readonly errorValue: unknown

  constructor(parameters: { decryptedPassword: string }) {
    this.errorMessage = `The password ${parameters.decryptedPassword} is invalid`
    this.errorValue = null
    this.name = 'InvalidPasswordFormatError'
    this.status = StatusError.INVALID
  }
}

import { STATUS_ERROR } from '../../shared/status-error'

export class InvalidJWTError {
  public readonly errorMessage: string
  public readonly errorValue: unknown
  public readonly name: 'InvalidJWTError'
  public readonly status: STATUS_ERROR

  constructor(parameters: { message: string; error: unknown }) {
    this.errorMessage = `Invalid JWT: ${parameters.message}`
    this.errorValue = parameters.error
    this.name = 'InvalidJWTError'
    this.status = STATUS_ERROR.INVALID
  }
}

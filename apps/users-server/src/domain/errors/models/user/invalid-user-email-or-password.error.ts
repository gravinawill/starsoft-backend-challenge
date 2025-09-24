import { type Email, StatusError } from '@niki/domain'

export class InvalidUserEmailOrPasswordError {
  public readonly errorMessage: string
  public readonly errorValue: unknown
  public readonly name: 'InvalidUserEmailOrPasswordError'
  public readonly status: StatusError

  constructor(parameters: { email: Email }) {
    this.errorMessage = `The email "${parameters.email.value}" or password provided is incorrect. Please check your credentials and try again.`
    this.errorValue = undefined
    this.name = 'InvalidUserEmailOrPasswordError'
    this.status = StatusError.INVALID
  }
}

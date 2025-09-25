import { STATUS_ERROR } from '@niki/domain'

export class InvalidSignInUseCaseParametersError {
  public readonly errorMessage: string
  public readonly errorValue: unknown
  public readonly name: 'InvalidSignInUseCaseParametersError'
  public readonly status: STATUS_ERROR

  constructor() {
    this.errorMessage = `The parameters provided are invalid. Please check your parameters and try again.`
    this.errorValue = null
    this.name = 'InvalidSignInUseCaseParametersError'
    this.status = STATUS_ERROR.INTERNAL_ERROR
  }
}

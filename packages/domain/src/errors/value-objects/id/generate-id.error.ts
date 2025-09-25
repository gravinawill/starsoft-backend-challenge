import { STATUS_ERROR } from '../../../shared/status-error'

export class GenerateIDError {
  public readonly errorMessage: string
  public readonly errorValue: unknown
  public readonly name: 'GenerateIDError'
  public readonly status: STATUS_ERROR

  constructor(parameters: { modelName: string; error: unknown } | { valueObjectName: string; error: unknown }) {
    this.errorMessage = `Error generating id to ${
      'modelName' in parameters ? 'model' : 'value object'
    } ${'modelName' in parameters ? parameters.modelName : parameters.valueObjectName}`
    this.errorValue = parameters.error
    this.name = 'GenerateIDError'
    this.status = STATUS_ERROR.INVALID
  }
}

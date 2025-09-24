import { StatusError } from '../../../shared/status-error'

export class InvalidIDError {
  public readonly errorMessage: string
  public readonly errorValue: unknown
  public readonly name: 'InvalidIDError'
  public readonly status: StatusError

  constructor(parameters: { id: string; modelName: string } | { id: string; valueObjectName: string }) {
    this.errorMessage = `Invalid ID to ${
      'valueObjectName' in parameters ? 'value object' : 'model'
    } ${'valueObjectName' in parameters ? parameters.valueObjectName : parameters.modelName}`
    this.errorValue = undefined
    this.name = 'InvalidIDError'
    this.status = StatusError.INVALID
  }
}

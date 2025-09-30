import { STATUS_ERROR } from '../../../shared/status-error'
import { type ID } from '../../../value-objects/id.value-object'

export class ProductAlreadyExistsError {
  public readonly errorMessage: string
  public readonly errorValue: unknown
  public readonly name: 'ProductAlreadyExistsError'
  public readonly status: STATUS_ERROR

  constructor(parameters: { productID: ID }) {
    this.errorMessage = `The product already exists with the ID: ${parameters.productID.value}`
    this.errorValue = { productID: parameters.productID }
    this.name = 'ProductAlreadyExistsError'
    this.status = STATUS_ERROR.CONFLICT
  }
}

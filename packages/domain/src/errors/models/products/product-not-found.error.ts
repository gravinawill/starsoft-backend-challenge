import { STATUS_ERROR } from '../../../shared/status-error'
import { type ID } from '../../../value-objects/id.value-object'

export class ProductNotFoundError {
  public readonly errorMessage: string
  public readonly errorValue: unknown
  public readonly name: 'ProductNotFoundError'
  public readonly status: STATUS_ERROR

  constructor(parameters: { productID: ID }) {
    this.errorMessage = `The product was not found with the ID: ${parameters.productID.value}`
    this.errorValue = { productID: parameters.productID }
    this.name = 'ProductNotFoundError'
    this.status = STATUS_ERROR.NOT_FOUND
  }
}

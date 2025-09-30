import { STATUS_ERROR } from '../../../shared/status-error'
import { type ID } from '../../../value-objects/id.value-object'

export class ProductsNotFoundError {
  public readonly errorMessage: string
  public readonly errorValue: unknown
  public readonly name: 'ProductsNotFoundError'
  public readonly status: STATUS_ERROR

  constructor(parameters: { productIDs: ID[] }) {
    this.errorMessage = `The products were not found with the IDs: ${parameters.productIDs.map((productID) => productID.value).join(', ')}`
    this.errorValue = { productIDs: parameters.productIDs }
    this.name = 'ProductsNotFoundError'
    this.status = STATUS_ERROR.NOT_FOUND
  }
}

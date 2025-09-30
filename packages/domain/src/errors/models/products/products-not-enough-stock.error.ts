import { STATUS_ERROR } from '../../../shared/status-error'
import { type ID } from '../../../value-objects/id.value-object'

export class ProductsNotEnoughStockError {
  public readonly errorMessage: string
  public readonly errorValue: { productIDs: ID[] }
  public readonly name: 'ProductsNotEnoughStockError'
  public readonly status: STATUS_ERROR

  constructor(parameters: { productIDs: ID[] }) {
    this.errorMessage =
      'The products do not have enough stock for the IDs: ' +
      parameters.productIDs.map((productID) => productID.value).join(', ')
    this.errorValue = { productIDs: parameters.productIDs }
    this.name = 'ProductsNotEnoughStockError'
    this.status = STATUS_ERROR.CONFLICT
  }
}

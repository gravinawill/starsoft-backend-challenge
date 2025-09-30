import { STATUS_ERROR } from '../../../shared/status-error'

export class OrderDuplicatedProductsError {
  public readonly errorMessage: string
  public readonly errorValue: unknown
  public readonly name: 'OrderDuplicatedProductsError'
  public readonly status: STATUS_ERROR

  constructor(parameters: { duplicatedProductIDs: string[] }) {
    this.errorMessage = `The order contains duplicated product IDs: ${parameters.duplicatedProductIDs.join(', ')}`
    this.errorValue = { duplicatedProductIDs: parameters.duplicatedProductIDs }
    this.name = 'OrderDuplicatedProductsError'
    this.status = STATUS_ERROR.CONFLICT
  }
}

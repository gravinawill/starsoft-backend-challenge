import { STATUS_ERROR } from '../../../shared/status-error'
import { type ID } from '../../../value-objects/id.value-object'

export class OrderNotFoundError {
  public readonly errorMessage: string
  public readonly errorValue: unknown
  public readonly name: 'OrderNotFoundError'
  public readonly status: STATUS_ERROR

  constructor(parameters: { orderID: ID }) {
    this.errorMessage = `The order was not found with the ID: ${parameters.orderID.value}`
    this.errorValue = { orderID: parameters.orderID }
    this.name = 'OrderNotFoundError'
    this.status = STATUS_ERROR.NOT_FOUND
  }
}

import { STATUS_ERROR } from '../../../shared/status-error'
import { type ID } from '../../../value-objects/id.value-object'

export class OrderAlreadyExistsError {
  public readonly errorMessage: string
  public readonly errorValue: unknown
  public readonly name: 'OrderAlreadyExistsError'
  public readonly status: STATUS_ERROR

  constructor(parameters: { orderID: ID }) {
    this.errorMessage = 'The order already exists with the ID: ' + parameters.orderID.value
    this.errorValue = { orderID: parameters.orderID }
    this.name = 'OrderAlreadyExistsError'
    this.status = STATUS_ERROR.CONFLICT
  }
}

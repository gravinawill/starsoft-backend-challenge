import { type User } from '../../../models'
import { STATUS_ERROR } from '../../../shared/status-error'

export class CustomersNotFoundError {
  public readonly errorMessage: string
  public readonly errorValue: unknown
  public readonly name: 'CustomersNotFoundError'
  public readonly status: STATUS_ERROR

  constructor(parameters: { customer: Pick<User, 'id'> }) {
    this.errorMessage = 'The customer not found with the ID: ' + parameters.customer.id.value
    this.errorValue = { customer: parameters.customer }
    this.name = 'CustomersNotFoundError'
    this.status = STATUS_ERROR.CONFLICT
  }
}

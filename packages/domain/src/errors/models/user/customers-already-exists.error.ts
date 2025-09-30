import { type User } from '../../../models'
import { STATUS_ERROR } from '../../../shared/status-error'

export class CustomersAlreadyExistsError {
  public readonly errorMessage: string
  public readonly errorValue: unknown
  public readonly name: 'CustomersAlreadyExistsError'
  public readonly status: STATUS_ERROR

  constructor(parameters: { customer: Pick<User, 'id'> }) {
    this.errorMessage = 'The customer already exists with the ID: ' + parameters.customer.id.value
    this.errorValue = { customer: parameters.customer }
    this.name = 'CustomersAlreadyExistsError'
    this.status = STATUS_ERROR.CONFLICT
  }
}

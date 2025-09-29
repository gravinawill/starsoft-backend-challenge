import { type Customer } from '@models/customer.model'
import { STATUS_ERROR } from '@niki/domain'

export class CustomersNotFoundError {
  public readonly errorMessage: string
  public readonly errorValue: unknown
  public readonly name: 'CustomersNotFoundError'
  public readonly status: STATUS_ERROR

  constructor(parameters: { customer: Pick<Customer, 'id'> }) {
    this.errorMessage = 'The customer not found with the ID: ' + parameters.customer.id.value
    this.errorValue = { customer: parameters.customer }
    this.name = 'CustomersNotFoundError'
    this.status = STATUS_ERROR.CONFLICT
  }
}

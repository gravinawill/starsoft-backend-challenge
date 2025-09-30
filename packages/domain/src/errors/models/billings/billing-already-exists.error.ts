import { STATUS_ERROR } from '../../../shared/status-error'
import { type ID } from '../../../value-objects/id.value-object'

export class BillingAlreadyExistsError {
  public readonly errorMessage: string
  public readonly errorValue: unknown
  public readonly name: 'BillingAlreadyExistsError'
  public readonly status: STATUS_ERROR

  constructor(parameters: { billingID: ID }) {
    this.errorMessage = 'The billing already exists with the ID: ' + parameters.billingID.value
    this.errorValue = { billingID: parameters.billingID }
    this.name = 'BillingAlreadyExistsError'
    this.status = STATUS_ERROR.CONFLICT
  }
}

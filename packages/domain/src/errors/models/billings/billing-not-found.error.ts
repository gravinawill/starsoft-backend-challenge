import { STATUS_ERROR } from '../../../shared/status-error'

export class BillingNotFoundError {
  public readonly errorMessage: string
  public readonly errorValue: unknown
  public readonly name: 'BillingNotFoundError'
  public readonly status: STATUS_ERROR

  constructor(parameters: { externalID: string } | { billingID: string }) {
    if ('externalID' in parameters) {
      this.errorMessage = `The billing was not found with the external ID: ${parameters.externalID}`
      this.errorValue = { externalID: parameters.externalID }
    } else if ('billingID' in parameters) {
      this.errorMessage = `The billing was not found with the billing ID: ${parameters.billingID}`
      this.errorValue = { billingID: parameters.billingID }
    } else {
      this.errorMessage = 'The billing was not found.'
      this.errorValue = null
    }
    this.name = 'BillingNotFoundError'
    this.status = STATUS_ERROR.NOT_FOUND
  }
}

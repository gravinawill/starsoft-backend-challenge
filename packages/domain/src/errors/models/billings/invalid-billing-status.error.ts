import type { ID } from '../../../value-objects/id.value-object'

import { STATUS_ERROR } from '../../../shared/status-error'

export class InvalidBillingStatusError {
  public readonly errorMessage: string
  public readonly errorValue: unknown
  public readonly name: 'InvalidBillingStatusError'
  public readonly status: STATUS_ERROR

  constructor(parameters: { orderStatus: string; billingID: ID }) {
    this.errorMessage = `The billing status is invalid: ${parameters.orderStatus} (Billing ID: ${parameters.billingID.value})`
    this.errorValue = { orderStatus: parameters.orderStatus, billingID: parameters.billingID }
    this.name = 'InvalidBillingStatusError'
    this.status = STATUS_ERROR.INVALID
  }
}

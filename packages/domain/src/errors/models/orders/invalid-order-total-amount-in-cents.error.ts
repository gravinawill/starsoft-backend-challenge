import { STATUS_ERROR } from '../../../shared/status-error'

export class InvalidOrderTotalAmountInCentsError {
  public readonly errorMessage: string
  public readonly errorValue: unknown
  public readonly name: 'InvalidOrderTotalAmountInCentsError'
  public readonly status: STATUS_ERROR

  constructor(parameters: { orderTotalAmountInCents: number }) {
    this.errorMessage = `The order total amount in cents is invalid: ${parameters.orderTotalAmountInCents}`
    this.errorValue = { orderTotalAmountInCents: parameters.orderTotalAmountInCents }
    this.name = 'InvalidOrderTotalAmountInCentsError'
    this.status = STATUS_ERROR.INVALID
  }
}

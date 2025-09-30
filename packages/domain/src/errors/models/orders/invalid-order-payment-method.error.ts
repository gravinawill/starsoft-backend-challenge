import { STATUS_ERROR } from '../../../shared/status-error'

export class InvalidOrderPaymentMethodError {
  public readonly errorMessage: string
  public readonly errorValue: unknown
  public readonly name: 'InvalidOrderPaymentMethodError'
  public readonly status: STATUS_ERROR

  constructor(parameters: { orderPaymentMethod: string }) {
    this.errorMessage = `The order payment method is invalid: ${parameters.orderPaymentMethod}`
    this.errorValue = { orderPaymentMethod: parameters.orderPaymentMethod }
    this.name = 'InvalidOrderPaymentMethodError'
    this.status = STATUS_ERROR.INVALID
  }
}

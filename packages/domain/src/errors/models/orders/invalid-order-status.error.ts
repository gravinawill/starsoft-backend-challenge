import { STATUS_ERROR } from '../../../shared/status-error'

export class InvalidOrderStatusError {
  public readonly errorMessage: string
  public readonly errorValue: unknown
  public readonly name: 'InvalidOrderStatusError'
  public readonly status: STATUS_ERROR

  constructor(parameters: { orderStatus: string }) {
    this.errorMessage = `The order status is invalid: ${parameters.orderStatus}`
    this.errorValue = { orderStatus: parameters.orderStatus }
    this.name = 'InvalidOrderStatusError'
    this.status = STATUS_ERROR.INVALID
  }
}

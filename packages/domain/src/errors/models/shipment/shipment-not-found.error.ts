import { STATUS_ERROR } from '../../../shared/status-error'
import { type ID } from '../../../value-objects/id.value-object'

export class ShipmentNotFoundError {
  public readonly errorMessage: string
  public readonly errorValue: unknown
  public readonly name: 'ShipmentNotFoundError'
  public readonly status: STATUS_ERROR

  constructor(parameters: { shipmentID: ID }) {
    this.errorMessage = `The shipment was not found with the ID: ${parameters.shipmentID.value}`
    this.errorValue = { shipmentID: parameters.shipmentID }
    this.name = 'ShipmentNotFoundError'
    this.status = STATUS_ERROR.NOT_FOUND
  }
}

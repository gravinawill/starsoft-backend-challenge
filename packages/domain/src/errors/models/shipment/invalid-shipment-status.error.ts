import { STATUS_ERROR } from '../../../shared/status-error'

export class InvalidShipmentStatusError {
  public readonly errorMessage: string
  public readonly errorValue: unknown
  public readonly name: 'InvalidShipmentStatusError'
  public readonly status: STATUS_ERROR

  constructor(parameters: { shipmentStatus: string; shipmentID: string }) {
    this.errorMessage = `The shipment status is invalid: ${parameters.shipmentStatus} (Shipment ID: ${parameters.shipmentID})`
    this.errorValue = { shipmentStatus: parameters.shipmentStatus, shipmentID: parameters.shipmentID }
    this.name = 'InvalidShipmentStatusError'
    this.status = STATUS_ERROR.INVALID
  }
}

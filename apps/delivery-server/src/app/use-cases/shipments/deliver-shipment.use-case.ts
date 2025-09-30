import { type Customer } from '@models/customer.model'
import { type Employee } from '@models/employee.model'
import { type Order } from '@models/order.model'
import { Shipment } from '@models/shipment.model'
import {
  ID,
  type InvalidIDError,
  type ISendLogErrorLoggerProvider,
  type ISendLogTimeUseCaseLoggerProvider,
  ModelName,
  type RepositoryError,
  ShipmentNotFoundError,
  UseCase
} from '@niki/domain'
import { type Either, failure, success } from '@niki/utils'
import { type IFindShipmentByIDShipmentsRepository } from '@repository-contracts/shipments/find-shipment-by-id.shipments-repository'
import { type IUpdateShipmentShipmentsRepository } from '@repository-contracts/shipments/update-shipment.shipments-repository'

export namespace DeliverShipmentUseCaseDTO {
  export type Parameters = Readonly<{
    employee: Pick<Employee, 'id'>
    shipmentID: string
  }>

  export type ResultFailure = Readonly<InvalidIDError | RepositoryError | ShipmentNotFoundError>
  export type ResultSuccess = Readonly<{
    shipmentDelivered: Pick<Shipment, 'id' | 'deliveredByEmployee' | 'status' | 'updatedAt'> & {
      deliveredAt: Date
      customer: Pick<Customer, 'id'>
      order: Pick<Order, 'id'>
    }
    message: string
  }>

  export type Result = Promise<Either<ResultFailure, ResultSuccess>>
}

export class DeliverShipmentUseCase extends UseCase<
  DeliverShipmentUseCaseDTO.Parameters,
  DeliverShipmentUseCaseDTO.ResultFailure,
  DeliverShipmentUseCaseDTO.ResultSuccess
> {
  constructor(
    loggerProvider: ISendLogTimeUseCaseLoggerProvider & ISendLogErrorLoggerProvider,
    private readonly shipmentsRepository: IFindShipmentByIDShipmentsRepository & IUpdateShipmentShipmentsRepository
  ) {
    super(loggerProvider)
  }

  protected async performOperation(parameters: DeliverShipmentUseCaseDTO.Parameters): DeliverShipmentUseCaseDTO.Result {
    const resultValidateShipmentID = ID.validate({ id: parameters.shipmentID, modelName: ModelName.SHIPMENT })
    if (resultValidateShipmentID.isFailure()) return failure(resultValidateShipmentID.value)
    const { idValidated: shipmentID } = resultValidateShipmentID.value

    const resultValidateEmployeeID = ID.validate({ id: parameters.employee.id.value, modelName: ModelName.EMPLOYEE })
    if (resultValidateEmployeeID.isFailure()) return failure(resultValidateEmployeeID.value)
    const { idValidated: employeeID } = resultValidateEmployeeID.value

    const resultFindShipment = await this.shipmentsRepository.findByID({ shipment: { id: shipmentID } })
    if (resultFindShipment.isFailure()) return failure(resultFindShipment.value)
    const { foundShipment } = resultFindShipment.value

    if (!foundShipment) return failure(new ShipmentNotFoundError({ shipmentID: shipmentID }))

    const { shipmentDelivered } = Shipment.deliverWithSuccess({
      shipment: foundShipment,
      deliveredByEmployee: { id: employeeID }
    })

    const resultUpdateShipment = await this.shipmentsRepository.update({ shipment: shipmentDelivered })
    if (resultUpdateShipment.isFailure()) return failure(resultUpdateShipment.value)

    return success({
      shipmentDelivered,
      message: `Shipment ${shipmentDelivered.id.value} delivered successfully by employee ${employeeID.value} at ${shipmentDelivered.deliveredAt.toISOString()}.`
    })
  }
}

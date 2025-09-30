import { Shipment } from '@models/shipment.model'
import {
  type GenerateIDError,
  ID,
  type InvalidIDError,
  type ISendLogErrorLoggerProvider,
  type ISendLogTimeUseCaseLoggerProvider,
  ModelName,
  type PaymentsPaymentDoneEventPayload,
  type RepositoryError,
  UseCase
} from '@niki/domain'
import { type Either, failure, success } from '@niki/utils'
import { type ISaveShipmentsRepository } from '@repository-contracts/shipments/save.shipments-repository'

export namespace CreateShipmentUseCaseDTO {
  export type Parameters = Readonly<{ payload: PaymentsPaymentDoneEventPayload }>

  export type ResultFailure = Readonly<InvalidIDError | RepositoryError | GenerateIDError>
  export type ResultSuccess = Readonly<{
    shipmentCreated: Shipment
    message: string
  }>

  export type Result = Promise<Either<ResultFailure, ResultSuccess>>
}

export class CreateShipmentUseCase extends UseCase<
  CreateShipmentUseCaseDTO.Parameters,
  CreateShipmentUseCaseDTO.ResultFailure,
  CreateShipmentUseCaseDTO.ResultSuccess
> {
  constructor(
    loggerProvider: ISendLogTimeUseCaseLoggerProvider & ISendLogErrorLoggerProvider,
    private readonly shipmentsRepository: ISaveShipmentsRepository
  ) {
    super(loggerProvider)
  }

  protected async performOperation(parameters: CreateShipmentUseCaseDTO.Parameters): CreateShipmentUseCaseDTO.Result {
    const resultValidateCustomerID = ID.validate({ id: parameters.payload.customerID, modelName: ModelName.USER })
    if (resultValidateCustomerID.isFailure()) return failure(resultValidateCustomerID.value)
    const { idValidated: customerID } = resultValidateCustomerID.value

    const resultValidateOrderID = ID.validate({ id: parameters.payload.orderID, modelName: ModelName.ORDER })
    if (resultValidateOrderID.isFailure()) return failure(resultValidateOrderID.value)
    const { idValidated: orderID } = resultValidateOrderID.value

    const resultCreateShipment = Shipment.create({
      order: { id: orderID },
      customer: { id: customerID }
    })
    if (resultCreateShipment.isFailure()) return failure(resultCreateShipment.value)
    const { shipmentCreated } = resultCreateShipment.value

    const resultSaveShipment = await this.shipmentsRepository.save({ shipment: shipmentCreated })
    if (resultSaveShipment.isFailure()) return failure(resultSaveShipment.value)

    return success({
      shipmentCreated,
      message: `Shipment for customer ${shipmentCreated.customer.id.value} and order ${shipmentCreated.order.id.value} created successfully with shipment ID: ${shipmentCreated.id.value}.`
    })
  }
}

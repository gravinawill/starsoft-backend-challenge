import { type Shipment } from '@models/shipment.model'
import { type InvalidIDError, type RepositoryError } from '@niki/domain'
import { type Either } from '@niki/utils'

export namespace FindShipmentByIDShipmentsRepositoryDTO {
  export type Parameters = Readonly<{ shipment: Pick<Shipment, 'id'> }>

  export type ResultFailure = Readonly<RepositoryError | InvalidIDError>
  export type ResultSuccess = Readonly<{
    foundShipment: Shipment | null
  }>

  export type Result = Promise<Either<ResultFailure, ResultSuccess>>
}

export interface IFindShipmentByIDShipmentsRepository {
  findByID(parameters: FindShipmentByIDShipmentsRepositoryDTO.Parameters): FindShipmentByIDShipmentsRepositoryDTO.Result
}

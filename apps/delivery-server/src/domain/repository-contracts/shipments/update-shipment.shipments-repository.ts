import { type Shipment } from '@models/shipment.model'
import { type RepositoryError } from '@niki/domain'
import { type Either } from '@niki/utils'

export namespace UpdateShipmentShipmentsRepositoryDTO {
  export type Parameters = Readonly<{
    shipment: Pick<Shipment, 'id' | 'deliveredAt' | 'deliveredByEmployee' | 'status' | 'updatedAt'>
  }>

  export type ResultFailure = Readonly<RepositoryError>
  export type ResultSuccess = Readonly<null>

  export type Result = Promise<Either<ResultFailure, ResultSuccess>>
}

export interface IUpdateShipmentShipmentsRepository {
  update(parameters: UpdateShipmentShipmentsRepositoryDTO.Parameters): UpdateShipmentShipmentsRepositoryDTO.Result
}

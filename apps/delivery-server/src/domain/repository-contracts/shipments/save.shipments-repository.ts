import { type Shipment } from '@models/shipment.model'
import { type RepositoryError } from '@niki/domain'
import { type Either } from '@niki/utils'

export namespace SaveShipmentsRepositoryDTO {
  export type Parameters = Readonly<{ shipment: Shipment }>

  export type ResultFailure = Readonly<RepositoryError>
  export type ResultSuccess = Readonly<null>

  export type Result = Promise<Either<ResultFailure, ResultSuccess>>
}

export interface ISaveShipmentsRepository {
  save(parameters: SaveShipmentsRepositoryDTO.Parameters): SaveShipmentsRepositoryDTO.Result
}

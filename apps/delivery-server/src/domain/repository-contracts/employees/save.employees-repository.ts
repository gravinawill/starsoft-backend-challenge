import { type Employee } from '@models/employee.model'
import { type RepositoryError } from '@niki/domain'
import { type Either } from '@niki/utils'

export namespace SaveEmployeesRepositoryDTO {
  export type Parameters = Readonly<{ employee: Employee }>

  export type ResultFailure = Readonly<RepositoryError>
  export type ResultSuccess = Readonly<null>

  export type Result = Promise<Either<ResultFailure, ResultSuccess>>
}

export interface ISaveEmployeesRepository {
  save(parameters: SaveEmployeesRepositoryDTO.Parameters): SaveEmployeesRepositoryDTO.Result
}

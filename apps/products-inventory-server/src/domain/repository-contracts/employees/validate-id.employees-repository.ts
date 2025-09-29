import { type Employee } from '@models/employee.model'
import { type InvalidIDError, type RepositoryError } from '@niki/domain'
import { type Either } from '@niki/utils'

export namespace ValidateIDEmployeesRepositoryDTO {
  export type Parameters = Readonly<{ employee: Pick<Employee, 'id'> }>

  export type ResultFailure = Readonly<RepositoryError | InvalidIDError>
  export type ResultSuccess = Readonly<{
    foundEmployee: null | Pick<Employee, 'id' | 'name'>
  }>

  export type Result = Promise<Either<ResultFailure, ResultSuccess>>
}

export interface IValidateIDEmployeesRepository {
  validateID(parameters: ValidateIDEmployeesRepositoryDTO.Parameters): ValidateIDEmployeesRepositoryDTO.Result
}

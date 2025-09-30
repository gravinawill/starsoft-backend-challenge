import { type Customer } from '@models/customer.model'
import { type InvalidIDError, type RepositoryError } from '@niki/domain'
import { type Either } from '@niki/utils'

export namespace ValidateIDCustomersRepositoryDTO {
  export type Parameters = Readonly<{ customer: Pick<Customer, 'id'> }>

  export type ResultFailure = Readonly<RepositoryError | InvalidIDError>
  export type ResultSuccess = Readonly<{
    foundCustomer: null | Pick<Customer, 'id'>
  }>

  export type Result = Promise<Either<ResultFailure, ResultSuccess>>
}

export interface IValidateIDCustomersRepository {
  validateID(parameters: ValidateIDCustomersRepositoryDTO.Parameters): ValidateIDCustomersRepositoryDTO.Result
}

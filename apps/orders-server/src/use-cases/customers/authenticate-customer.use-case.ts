import { CustomersNotFoundError } from '@errors/models/customers/customers-not-found.error'
import { type Customer } from '@models/customer.model'
import {
  type InvalidIDError,
  type InvalidJWTError,
  type ISendLogErrorLoggerProvider,
  type ISendLogTimeUseCaseLoggerProvider,
  type IVerifyJWTTokenProvider,
  type ProviderError,
  type RepositoryError,
  UseCase
} from '@niki/domain'
import { type Either, failure, success } from '@niki/utils'
import { type IValidateIDCustomersRepository } from '@repository-contracts/customers/validate-id.customers-repository'

export namespace AuthenticateEmployeeUseCaseDTO {
  export type Parameters = Readonly<{ accessToken: string }>

  export type ResultFailure = Readonly<
    ProviderError | InvalidIDError | CustomersNotFoundError | RepositoryError | InvalidJWTError
  >
  export type ResultSuccess = Readonly<{ customer: Pick<Customer, 'id'> }>

  export type Result = Promise<Either<ResultFailure, ResultSuccess>>
}

export class AuthenticateEmployeeUseCase extends UseCase<
  AuthenticateEmployeeUseCaseDTO.Parameters,
  AuthenticateEmployeeUseCaseDTO.ResultFailure,
  AuthenticateEmployeeUseCaseDTO.ResultSuccess
> {
  constructor(
    loggerProvider: ISendLogTimeUseCaseLoggerProvider & ISendLogErrorLoggerProvider,
    private readonly customersRepository: IValidateIDCustomersRepository,
    private readonly tokenProvider: IVerifyJWTTokenProvider
  ) {
    super(loggerProvider)
  }

  protected async performOperation(
    parameters: AuthenticateEmployeeUseCaseDTO.Parameters
  ): AuthenticateEmployeeUseCaseDTO.Result {
    const resultVerifyToken = this.tokenProvider.verifyJWT({ jwtToken: parameters.accessToken })
    if (resultVerifyToken.isFailure()) return failure(resultVerifyToken.value)
    const { userID } = resultVerifyToken.value

    const resultValidateID = await this.customersRepository.validateID({ customer: { id: userID } })
    if (resultValidateID.isFailure()) return failure(resultValidateID.value)
    const { foundCustomer } = resultValidateID.value

    if (foundCustomer === null) return failure(new CustomersNotFoundError({ customer: { id: userID } }))

    return success({ customer: { id: userID } })
  }
}

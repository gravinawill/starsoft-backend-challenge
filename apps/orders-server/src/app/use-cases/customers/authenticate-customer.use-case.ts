import { type Customer } from '@models/customer.model'
import {
  CustomersNotFoundError,
  type InvalidIDError,
  InvalidJWTError,
  type ISendLogErrorLoggerProvider,
  type ISendLogTimeUseCaseLoggerProvider,
  type IVerifyJWTTokenProvider,
  type ProviderError,
  type RepositoryError,
  UseCase
} from '@niki/domain'
import { type Either, failure, success } from '@niki/utils'
import { type IValidateIDCustomersRepository } from '@repository-contracts/customers/validate-id.customers-repository'

export namespace AuthenticateCustomerUseCaseDTO {
  export type Parameters = Readonly<{ bearerToken: string | undefined }>

  export type ResultFailure = Readonly<
    ProviderError | InvalidIDError | CustomersNotFoundError | RepositoryError | InvalidJWTError
  >
  export type ResultSuccess = Readonly<{ customer: Pick<Customer, 'id'> }>

  export type Result = Promise<Either<ResultFailure, ResultSuccess>>
}

export class AuthenticateCustomerUseCase extends UseCase<
  AuthenticateCustomerUseCaseDTO.Parameters,
  AuthenticateCustomerUseCaseDTO.ResultFailure,
  AuthenticateCustomerUseCaseDTO.ResultSuccess
> {
  constructor(
    loggerProvider: ISendLogTimeUseCaseLoggerProvider & ISendLogErrorLoggerProvider,
    private readonly customersRepository: IValidateIDCustomersRepository,
    private readonly tokenProvider: IVerifyJWTTokenProvider
  ) {
    super(loggerProvider)
  }

  protected async performOperation(
    parameters: AuthenticateCustomerUseCaseDTO.Parameters
  ): AuthenticateCustomerUseCaseDTO.Result {
    if (!parameters.bearerToken?.startsWith('Bearer ')) {
      return failure(
        new InvalidJWTError({ message: 'Authorization header with Bearer token is required', error: null })
      )
    }

    const accessToken = parameters.bearerToken.split(' ')[1]
    if (!accessToken) return failure(new InvalidJWTError({ message: 'Bearer token is required', error: null }))

    const resultVerifyToken = this.tokenProvider.verifyJWT({ jwtToken: accessToken })
    if (resultVerifyToken.isFailure()) return failure(resultVerifyToken.value)
    const { userID } = resultVerifyToken.value

    const resultValidateID = await this.customersRepository.validateID({ customer: { id: userID } })
    if (resultValidateID.isFailure()) return failure(resultValidateID.value)
    const { foundCustomer } = resultValidateID.value

    if (foundCustomer === null) return failure(new CustomersNotFoundError({ customer: { id: userID } }))

    return success({ customer: { id: userID } })
  }
}

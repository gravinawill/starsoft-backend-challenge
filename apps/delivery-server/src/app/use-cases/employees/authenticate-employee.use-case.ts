import { type Employee } from '@models/employee.model'
import {
  EmployeeNotFoundError,
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
import { type IValidateIDEmployeesRepository } from '@repository-contracts/employees/validate-id.employees-repository'

export namespace AuthenticateEmployeeUseCaseDTO {
  export type Parameters = Readonly<{ accessToken: string }>

  export type ResultFailure = Readonly<
    ProviderError | InvalidIDError | EmployeeNotFoundError | RepositoryError | InvalidJWTError
  >
  export type ResultSuccess = Readonly<{ employee: Pick<Employee, 'id'> }>

  export type Result = Promise<Either<ResultFailure, ResultSuccess>>
}

export class AuthenticateEmployeeUseCase extends UseCase<
  AuthenticateEmployeeUseCaseDTO.Parameters,
  AuthenticateEmployeeUseCaseDTO.ResultFailure,
  AuthenticateEmployeeUseCaseDTO.ResultSuccess
> {
  constructor(
    loggerProvider: ISendLogTimeUseCaseLoggerProvider & ISendLogErrorLoggerProvider,
    private readonly employeesRepository: IValidateIDEmployeesRepository,
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

    const resultValidateID = await this.employeesRepository.validateID({ employee: { id: userID } })
    if (resultValidateID.isFailure()) return failure(resultValidateID.value)
    const { foundEmployee } = resultValidateID.value

    if (foundEmployee === null) return failure(new EmployeeNotFoundError({ employeeID: userID }))

    return success({ employee: { id: userID } })
  }
}

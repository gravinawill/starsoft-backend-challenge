import { Employee } from '@models/employee.model'
import {
  EmployeeAlreadyExistsError,
  ID,
  type InvalidIDError,
  type ISendLogErrorLoggerProvider,
  type ISendLogTimeUseCaseLoggerProvider,
  ModelName,
  type RepositoryError,
  UseCase,
  type UsersEmployeeCreatedEvent
} from '@niki/domain'
import { type Either, failure, success } from '@niki/utils'
import { type ISaveEmployeesRepository } from '@repository-contracts/employees/save.employees-repository'
import { type IValidateIDEmployeesRepository } from '@repository-contracts/employees/validate-id.employees-repository'

export namespace CreateEmployeeByEventUseCaseDTO {
  export type Parameters = Readonly<{ parameters: { event: UsersEmployeeCreatedEvent['payload'] } }>

  export type ResultFailure = Readonly<InvalidIDError | EmployeeAlreadyExistsError | RepositoryError>
  export type ResultSuccess = Readonly<{ employeeCreated: Pick<Employee, 'id'> }>

  export type Result = Promise<Either<ResultFailure, ResultSuccess>>
}

export class CreateEmployeeByEventUseCase extends UseCase<
  CreateEmployeeByEventUseCaseDTO.Parameters,
  CreateEmployeeByEventUseCaseDTO.ResultFailure,
  CreateEmployeeByEventUseCaseDTO.ResultSuccess
> {
  constructor(
    loggerProvider: ISendLogTimeUseCaseLoggerProvider & ISendLogErrorLoggerProvider,
    private readonly employeesRepository: ISaveEmployeesRepository & IValidateIDEmployeesRepository
  ) {
    super(loggerProvider)
  }

  protected async performOperation(
    parameters: CreateEmployeeByEventUseCaseDTO.Parameters
  ): CreateEmployeeByEventUseCaseDTO.Result {
    const resultValidateID = ID.validate({ id: parameters.parameters.event.userID, modelName: ModelName.USER })
    if (resultValidateID.isFailure()) return failure(resultValidateID.value)
    const { idValidated: userID } = resultValidateID.value

    const resultValidateIDEmployee = await this.employeesRepository.validateID({ employee: { id: userID } })
    if (resultValidateIDEmployee.isFailure()) return failure(resultValidateIDEmployee.value)
    const { foundEmployee } = resultValidateIDEmployee.value
    if (foundEmployee !== null) return failure(new EmployeeAlreadyExistsError({ employeeID: userID }))

    const { employeeCreated } = Employee.create({
      id: userID,
      name: parameters.parameters.event.name,
      createdAt: parameters.parameters.event.createdAt,
      updatedAt: parameters.parameters.event.updatedAt,
      deletedAt: null
    })

    const resultSaveEmployee = await this.employeesRepository.save({ employee: employeeCreated })
    if (resultSaveEmployee.isFailure()) return failure(resultSaveEmployee.value)

    return success({ employeeCreated })
  }
}

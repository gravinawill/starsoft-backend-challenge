import { Database } from '../database'
import {
  ISaveEmployeesRepository,
  SaveEmployeesRepositoryDTO
} from '@repository-contracts/employees/save.employees-repository'
import {
  IValidateIDEmployeesRepository,
  ValidateIDEmployeesRepositoryDTO
} from '@repository-contracts/employees/validate-id.employees-repository'

import { ID, type ILoggerProvider, ModelName, RepositoryError } from '@niki/domain'
import { failure, success } from '@niki/utils'

export class EmployeesPrismaRepository implements IValidateIDEmployeesRepository, ISaveEmployeesRepository {
  constructor(
    private readonly logger: ILoggerProvider,
    private readonly database: Database
  ) {}

  public async validateID(
    parameters: ValidateIDEmployeesRepositoryDTO.Parameters
  ): ValidateIDEmployeesRepositoryDTO.Result {
    try {
      const found = await this.database.prisma.employee.findUnique({
        where: { id: parameters.employee.id.value },
        select: { id: true, name: true }
      })

      if (found === null) return success({ foundEmployee: null })

      const resultValidateID = ID.validate({ id: found.id, modelName: ModelName.EMPLOYEE })
      if (resultValidateID.isFailure()) return failure(resultValidateID.value)
      const { idValidated: employeeID } = resultValidateID.value

      return success({ foundEmployee: { id: employeeID, name: found.name } })
    } catch (error: unknown) {
      const repositoryError = new RepositoryError({
        error,
        repository: { method: 'validate id', name: 'employees', externalName: 'prisma' }
      })
      this.logger.sendLogError({ message: repositoryError.errorMessage, value: repositoryError })
      return failure(repositoryError)
    }
  }

  public async save(parameters: SaveEmployeesRepositoryDTO.Parameters): SaveEmployeesRepositoryDTO.Result {
    try {
      await this.database.prisma.employee.create({
        data: {
          id: parameters.employee.id.value,
          name: parameters.employee.name,
          createdAt: parameters.employee.createdAt,
          updatedAt: parameters.employee.updatedAt,
          deletedAt: parameters.employee.deletedAt
        },
        select: { id: true }
      })
      return success(null)
    } catch (error: unknown) {
      const repositoryError = new RepositoryError({
        error,
        repository: { method: 'save', name: 'employees', externalName: 'prisma' }
      })
      this.logger.sendLogError({ message: repositoryError.errorMessage, value: repositoryError })
      return failure(repositoryError)
    }
  }
}

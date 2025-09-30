import { ID, type ILoggerProvider, ModelName, RepositoryError } from '@niki/domain'
import { failure, success } from '@niki/utils'
import {
  type ISaveCustomersRepository,
  type SaveCustomersRepositoryDTO
} from '@repository-contracts/customers/save.customers-repository'
import {
  type IValidateIDCustomersRepository,
  type ValidateIDCustomersRepositoryDTO
} from '@repository-contracts/customers/validate-id.customers-repository'

import { type Database } from '../database'

export class CustomersPrismaRepository implements IValidateIDCustomersRepository, ISaveCustomersRepository {
  constructor(
    private readonly logger: ILoggerProvider,
    private readonly database: Database
  ) {}

  public async validateID(
    parameters: ValidateIDCustomersRepositoryDTO.Parameters
  ): ValidateIDCustomersRepositoryDTO.Result {
    try {
      const found = await this.database.prisma.customer.findUnique({
        where: { id: parameters.customer.id.value },
        select: { id: true }
      })

      if (found === null) return success({ foundCustomer: null })

      const resultValidateID = ID.validate({ id: found.id, modelName: ModelName.CUSTOMER })
      if (resultValidateID.isFailure()) return failure(resultValidateID.value)
      const { idValidated: customerID } = resultValidateID.value

      return success({ foundCustomer: { id: customerID } })
    } catch (error: unknown) {
      console.log(error)
      const repositoryError = new RepositoryError({
        error,
        repository: { method: 'validate id', name: 'customers', externalName: 'prisma' }
      })
      this.logger.sendLogError({ message: repositoryError.errorMessage, value: repositoryError })
      return failure(repositoryError)
    }
  }

  public async save(parameters: SaveCustomersRepositoryDTO.Parameters): SaveCustomersRepositoryDTO.Result {
    try {
      await this.database.prisma.customer.create({
        data: {
          id: parameters.customer.id.value,
          createdAt: parameters.customer.createdAt,
          updatedAt: parameters.customer.updatedAt,
          deletedAt: parameters.customer.deletedAt
        },
        select: { id: true }
      })
      return success(null)
    } catch (error: unknown) {
      const repositoryError = new RepositoryError({
        error,
        repository: { method: 'save', name: 'customers', externalName: 'prisma' }
      })
      this.logger.sendLogError({ message: repositoryError.errorMessage, value: repositoryError })
      return failure(repositoryError)
    }
  }
}

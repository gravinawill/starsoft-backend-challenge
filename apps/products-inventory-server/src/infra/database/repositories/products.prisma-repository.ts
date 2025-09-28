import type { Database } from '../database'
import type {
  ISaveProductsRepository,
  SaveProductsRepositoryDTO
} from '@repository-contracts/products/save.products-repository'
import type {
  IValidateIDProductsRepository,
  ValidateIDProductsRepositoryDTO
} from '@repository-contracts/products/validate-id.products-repository'

import { ID, type ILoggerProvider, ModelName, RepositoryError } from '@niki/domain'
import { failure, success } from '@niki/utils'

export class ProductsPrismaRepository implements IValidateIDProductsRepository, ISaveProductsRepository {
  constructor(
    private readonly logger: ILoggerProvider,
    private readonly database: Database
  ) {}

  public async validateID(
    parameters: ValidateIDProductsRepositoryDTO.Parameters
  ): ValidateIDProductsRepositoryDTO.Result {
    try {
      const found = await this.database.prisma.product.findUnique({
        where: { id: parameters.product.id.value },
        select: { id: true, name: true }
      })

      if (found === null) return success({ foundProduct: null })

      const resultValidateID = ID.validate({ id: found.id, modelName: ModelName.PRODUCT })
      if (resultValidateID.isFailure()) return failure(resultValidateID.value)
      const { idValidated: productID } = resultValidateID.value

      return success({ foundProduct: { id: productID, name: found.name } })
    } catch (error: unknown) {
      const repositoryError = new RepositoryError({
        error,
        repository: { method: 'validate id', name: 'products', externalName: 'prisma' }
      })
      this.logger.sendLogError({ message: repositoryError.errorMessage, value: repositoryError })
      return failure(repositoryError)
    }
  }

  public async save(parameters: SaveProductsRepositoryDTO.Parameters): SaveProductsRepositoryDTO.Result {
    try {
      await this.database.prisma.product.create({
        data: {
          name: parameters.product.name,
          priceInCents: parameters.product.priceInCents,
          availableCount: parameters.product.availableCount,
          unavailableCount: parameters.product.unavailableCount,
          createdByEmployeeID: parameters.product.createdByEmployee.id.value,
          createdAt: parameters.product.createdAt,
          updatedAt: parameters.product.updatedAt,
          deletedAt: parameters.product.deletedAt,
          id: parameters.product.id.value
        },
        select: { id: true }
      })
      return success(null)
    } catch (error: unknown) {
      const repositoryError = new RepositoryError({
        error,
        repository: { method: 'save', name: 'products', externalName: 'prisma' }
      })
      this.logger.sendLogError({ message: repositoryError.errorMessage, value: repositoryError })
      return failure(repositoryError)
    }
  }
}

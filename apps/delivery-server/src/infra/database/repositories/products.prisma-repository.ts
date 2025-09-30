import { type Product } from '@models/product.model'
import { ID, type ILoggerProvider, ModelName, RepositoryError } from '@niki/domain'
import { failure, success } from '@niki/utils'
import {
  type ISaveProductsRepository,
  type SaveProductsRepositoryDTO
} from '@repository-contracts/products/save.products-repository'
import {
  type IValidateIDProductsRepository,
  type ValidateIDProductsRepositoryDTO
} from '@repository-contracts/products/validate-id.products-repository'
import {
  type IValidateIDsProductsRepository,
  type ValidateIDsProductsRepositoryDTO
} from '@repository-contracts/products/validate-ids.products-repository'

import { type Database } from '../database'

export class ProductsPrismaRepository
  implements IValidateIDProductsRepository, ISaveProductsRepository, IValidateIDsProductsRepository
{
  constructor(
    private readonly logger: ILoggerProvider,
    private readonly database: Database
  ) {}

  public async validateIDs(
    parameters: ValidateIDsProductsRepositoryDTO.Parameters
  ): ValidateIDsProductsRepositoryDTO.Result {
    try {
      const productIDs = parameters.products.map((product) => product.id.value)
      if (productIDs.length === 0) return success({ foundProducts: [], notFoundProducts: [] })

      const found = await this.database.prisma.product.findMany({
        where: { id: { in: productIDs } },
        select: { id: true }
      })

      if (found.length === 0) return success({ foundProducts: [], notFoundProducts: parameters.products })
      const foundIDsSet = new Set(found.map((product) => product.id))
      const foundProducts: Array<Pick<Product, 'id'>> = []
      const notFoundProducts: Array<Pick<Product, 'id'>> = []

      for (const product of parameters.products) {
        if (foundIDsSet.has(product.id.value)) foundProducts.push({ id: product.id })
        else notFoundProducts.push(product)
      }

      return success({ foundProducts, notFoundProducts })
    } catch (error: unknown) {
      const repositoryError = new RepositoryError({
        error,
        repository: { method: 'validate id', name: 'products', externalName: 'prisma' }
      })
      this.logger.sendLogError({ message: repositoryError.errorMessage, value: repositoryError })
      return failure(repositoryError)
    }
  }

  public async validateID(
    parameters: ValidateIDProductsRepositoryDTO.Parameters
  ): ValidateIDProductsRepositoryDTO.Result {
    try {
      const found = await this.database.prisma.product.findUnique({
        where: { id: parameters.product.id.value },
        select: { id: true }
      })

      if (found === null) return success({ foundProduct: null })

      const resultValidateID = ID.validate({ id: found.id, modelName: ModelName.PRODUCT })
      if (resultValidateID.isFailure()) return failure(resultValidateID.value)
      const { idValidated: productID } = resultValidateID.value

      return success({ foundProduct: { id: productID } })
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

import { type Product } from '@models/product.model'
import { ID, type ILoggerProvider, ModelName, RepositoryError } from '@niki/domain'
import { failure, success } from '@niki/utils'
import {
  type FindAndUpdateAvailabilityProductsRepositoryDTO,
  type IFindAndUpdateAvailabilityProductsRepository
} from '@repository-contracts/products/find-and-update-availability.products-repository'
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
  implements
    IValidateIDProductsRepository,
    ISaveProductsRepository,
    IValidateIDsProductsRepository,
    IFindAndUpdateAvailabilityProductsRepository
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
        select: { id: true, priceInCents: true }
      })

      if (found.length === 0) return success({ foundProducts: [], notFoundProducts: parameters.products })
      const foundProducts: Array<Pick<Product, 'id' | 'priceInCents'>> = []
      const notFoundProducts: Array<Pick<Product, 'id'>> = []

      for (const product of parameters.products) {
        const foundProduct = found.find((p) => p.id === product.id.value)
        if (foundProduct) {
          foundProducts.push({ id: product.id, priceInCents: foundProduct.priceInCents })
        } else {
          notFoundProducts.push(product)
        }
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

  public async findAndUpdateAvailability(
    parameters: FindAndUpdateAvailabilityProductsRepositoryDTO.Parameters
  ): FindAndUpdateAvailabilityProductsRepositoryDTO.Result {
    try {
      const productIDs = parameters.productsToFind.map((p) => p.id.value)
      //@ts-expect-error - transaction
      await this.database.prisma.$transaction(async (tx) => {
        const foundProducts = await tx.product.findMany({
          where: { id: { in: productIDs }, deletedAt: null },
          select: {
            id: true,
            availableCount: true,
            unavailableCount: true,
            priceInCents: true
          }
        })

        const products = foundProducts
          .map((product) => {
            const resultValidateID = ID.validate({ id: product.id, modelName: ModelName.PRODUCT })
            if (resultValidateID.isFailure()) return null
            const { idValidated: productID } = resultValidateID.value
            return {
              id: productID,
              availableCount: product.availableCount,
              unavailableCount: product.unavailableCount,
              priceInCents: product.priceInCents
            }
          })
          .filter((product) => product !== null)

        const resultExecute = parameters.executeWithinTransaction(products)
        if (resultExecute.isFailure()) return failure(resultExecute.value)

        const { productsToUpdate } = resultExecute.value

        for (const productUpdate of productsToUpdate) {
          await tx.product.update({
            where: { id: productUpdate.id.value },
            data: {
              availableCount: productUpdate.availableCount,
              unavailableCount: productUpdate.unavailableCount,
              updatedAt: productUpdate.updatedAt
            }
          })
        }
      })

      return success(null)
    } catch (error: unknown) {
      const repositoryError = new RepositoryError({
        error,
        repository: { method: 'findAndUpdateAvailability', name: 'products', externalName: 'prisma' }
      })
      this.logger.sendLogError({ message: repositoryError.errorMessage, value: repositoryError })
      return failure(repositoryError)
    }
  }
}

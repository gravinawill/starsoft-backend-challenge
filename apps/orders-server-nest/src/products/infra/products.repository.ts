import { Injectable } from '@nestjs/common'
import { AppLogger } from '@shared/logger/logger.service'
import { type Either, failure, success } from '@utils/either.util'
import { DataSource, In, Repository } from 'typeorm'

import { ProductEntity } from '../entities/product.entity'

@Injectable()
export class ProductsRepository extends Repository<ProductEntity> {
  constructor(
    private dataSource: DataSource,
    private logger: AppLogger
  ) {
    super(ProductEntity, dataSource.createEntityManager())
  }

  async saveProduct(
    product: Pick<ProductEntity, 'createdAt' | 'updatedAt' | 'deletedAt' | 'id'>
  ): Promise<Either<{ message: string }, null>> {
    try {
      await this.save(product)
      return success(null)
    } catch (error) {
      this.logger.error({
        message: 'Error saving product',
        meta: { error: error }
      })
      return failure({ message: 'Error saving product' })
    }
  }

  async findManyProducts(
    ids: string[]
  ): Promise<Either<{ message: string }, { foundProducts: Array<Pick<ProductEntity, 'id'>> }>> {
    if (!Array.isArray(ids) || ids.length === 0) {
      return success({ foundProducts: [] })
    }

    try {
      const foundProducts = await this.find({
        where: { id: In(ids) },
        select: ['id']
      })

      return success({ foundProducts })
    } catch (error) {
      this.logger.error({
        message: 'Error finding products',
        meta: { error }
      })
      return failure({ message: 'Error finding products' })
    }
  }
}

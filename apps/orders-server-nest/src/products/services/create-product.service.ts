import { Injectable } from '@nestjs/common'
import { AppLogger } from '@shared/logger/logger.service'
import { Either } from '@utils/either.util'

import { ProductsRepository } from '../infra/products.repository'

@Injectable()
export class ProductService {
  constructor(
    private repository: ProductsRepository,
    private readonly logger: AppLogger
  ) {
    this.logger.setContext(ProductService.name)
  }

  public async createProduct(parameters: {
    product: { id: string; createdAt: Date; updatedAt: Date; deletedAt: Date | null }
  }): Promise<Either<{ message: string }, null>> {
    const resultSaveProduct = await this.repository.saveProduct({
      createdAt: parameters.product.createdAt,
      updatedAt: parameters.product.updatedAt,
      deletedAt: parameters.product.deletedAt,
      id: parameters.product.id
    })
    return resultSaveProduct
  }
}

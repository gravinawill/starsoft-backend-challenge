import { randomUUID } from 'node:crypto'

import { Injectable } from '@nestjs/common'
import { AppLogger } from '@shared/logger/logger.service'
import { type Either, failure, success } from '@utils/either.util'
import { DataSource, Repository } from 'typeorm'

import { OrderEntity } from '../entities/order.entity'

@Injectable()
export class OrderRepository extends Repository<OrderEntity> {
  constructor(
    private dataSource: DataSource,
    private logger: AppLogger
  ) {
    super(OrderEntity, dataSource.createEntityManager())
  }

  async saveOrder(parameters: {
    order: Pick<OrderEntity, 'customerID' | 'paymentMethod' | 'totalAmountInCents' | 'status'>
  }): Promise<Either<{ message: string }, { orderSaved: { id: string } }>> {
    try {
      const order = await this.save({
        ...parameters.order,
        createdAt: new Date(),
        id: randomUUID(),
        updatedAt: new Date(),
        deletedAt: null
      })
      return success({ orderSaved: { id: order.id } })
    } catch (error) {
      this.logger.error({
        message: 'Error saving order',
        meta: { error: error }
      })
      return failure({ message: 'Error saving order' })
    }
  }
}

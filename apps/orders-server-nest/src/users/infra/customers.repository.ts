import { Injectable } from '@nestjs/common'
import { AppLogger } from '@shared/logger/logger.service'
import { type Either, failure, success } from '@utils/either.util'
import { DataSource, Repository } from 'typeorm'

import { CustomerEntity } from '../entities/customer.entity'

@Injectable()
export class CustomerRepository extends Repository<CustomerEntity> {
  constructor(
    private dataSource: DataSource,
    private logger: AppLogger
  ) {
    super(CustomerEntity, dataSource.createEntityManager())
  }

  async validateID(parameters: {
    id: string
  }): Promise<Either<{ message: string }, { foundCustomer: CustomerEntity | null }>> {
    try {
      const user = await this.findOne({ where: { id: parameters.id } })
      if (user === null) return success({ foundCustomer: null })
      return success({ foundCustomer: user })
    } catch (error) {
      this.logger.error({
        message: 'Error validating customer id',
        meta: { error: error }
      })
      return failure({ message: 'Error validating customer id' })
    }
  }

  async saveCustomer(customer: CustomerEntity): Promise<Either<{ message: string }, null>> {
    try {
      await this.save(customer)
      return success(null)
    } catch (error) {
      this.logger.error({
        message: 'Error saving customer',
        meta: { error: error }
      })
      return failure({ message: 'Error saving customer' })
    }
  }
}

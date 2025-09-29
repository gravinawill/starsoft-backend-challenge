import { Injectable } from '@nestjs/common'
import { AppLogger } from '@shared/logger/logger.service'
import { Either } from '@utils/either.util'

import { CustomerRepository } from '../infra/customers.repository'

@Injectable()
export class CustomerService {
  constructor(
    private repository: CustomerRepository,
    private readonly logger: AppLogger
  ) {
    this.logger.setContext(CustomerService.name)
  }

  async createCustomer(customerData: {
    name: string
    id: string
    createdAt: Date
    updatedAt: Date
  }): Promise<Either<{ message: string }, null>> {
    const customer = this.repository.create(customerData)
    const resultSaveCustomer = await this.repository.saveCustomer(customer)
    return resultSaveCustomer
  }
}

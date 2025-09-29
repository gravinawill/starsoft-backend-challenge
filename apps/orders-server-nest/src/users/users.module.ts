import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { KafkaModule } from '@shared/kafka/kafka.module'
import { SharedModule } from '@shared/shared.module'

import { CustomerController } from './controllers/customer.controller'
import { CustomerEntity } from './entities/customer.entity'
import { CustomerRepository } from './infra/customers.repository'
import { AuthCustomerService } from './services/auth-customer.service'
import { CustomerService } from './services/create-customer.service'

@Module({
  imports: [SharedModule, TypeOrmModule.forFeature([CustomerEntity]), KafkaModule],
  providers: [CustomerRepository, CustomerService, AuthCustomerService],
  controllers: [CustomerController],
  exports: [CustomerRepository, CustomerService, AuthCustomerService]
})
export class UsersModule {}

import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { KafkaModule } from '@shared/kafka/kafka.module'
import { SharedModule } from '@shared/shared.module'

import { ProductsModule } from '@/products/products.module'
import { UsersModule } from '@/users/users.module'

import { CreateOrderController } from './controllers/create-order/create-order.controller'
import { OrderEntity } from './entities/order.entity'
import { OrderProductEntity } from './entities/order-product.entity'
import { OrderRepository } from './infra/orders.repository'
import { CreateOrderService } from './services/create-order.service'

@Module({
  imports: [
    SharedModule,
    ProductsModule,
    UsersModule,
    TypeOrmModule.forFeature([OrderEntity, OrderProductEntity]),
    KafkaModule
  ],
  providers: [OrderRepository, CreateOrderService],
  controllers: [CreateOrderController],
  exports: [OrderRepository, CreateOrderService]
})
export class OrdersModule {}

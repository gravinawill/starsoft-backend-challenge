import { Module } from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ProductEntity } from '@products/entities/product.entity'
import { CustomerEntity } from '@users/entities/customer.entity'

import { OrderEntity } from '@/orders/entities/order.entity'
import { OrderProductEntity } from '@/orders/entities/order-product.entity'

import { LoggingInterceptor } from './interceptors/logging.interceptor'
import { KafkaModule } from './kafka/kafka.module'
import { KafkaConsumerService } from './kafka/kafka-consumer.service'
import { KafkaProducerService } from './kafka/kafka-producer.service'
import { AppLoggerModule } from './logger/logger.module'

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [],
      inject: [],
      useFactory: () => ({
        type: 'postgres',
        host: process.env.POSTGRESQL_HOST,
        port: process.env.POSTGRESQL_PORT ? Number(process.env.POSTGRESQL_PORT) : undefined,
        database: process.env.POSTGRESQL_DATABASE_ORDERS_SERVER,
        username: process.env.POSTGRESQL_USERNAME,
        password: process.env.POSTGRESQL_PASSWORD,
        entities: [
          // eslint-disable-next-line unicorn/prefer-module, n/no-path-concat -- needed for typeorm
          __dirname + '/src/**/entities/*.entity{.ts,.js}',
          CustomerEntity,
          ProductEntity,
          OrderEntity,
          OrderProductEntity
        ],
        // eslint-disable-next-line unicorn/prefer-module, n/no-path-concat -- needed for typeorm
        migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
        timezone: 'Z',
        synchronize: false,
        debug: process.env.NODE_ENV === 'development'
      })
    }),
    AppLoggerModule,
    KafkaModule
  ],
  exports: [AppLoggerModule, KafkaModule],
  providers: [{ provide: APP_INTERCEPTOR, useClass: LoggingInterceptor }, KafkaProducerService, KafkaConsumerService]
})
export class SharedModule {}

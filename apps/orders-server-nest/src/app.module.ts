import { Module } from '@nestjs/common'
import { SharedModule } from '@shared/shared.module'
import { UsersModule } from '@users/users.module'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { OrdersModule } from './orders/orders.module'
import { ProductsModule } from './products/products.module'

@Module({
  imports: [SharedModule, UsersModule, OrdersModule, ProductsModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}

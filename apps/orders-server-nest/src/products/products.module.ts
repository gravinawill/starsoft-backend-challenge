import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SharedModule } from '@shared/shared.module'

import { ProductController } from './controllers/products.controller'
import { ProductEntity } from './entities/product.entity'
import { ProductsRepository } from './infra/products.repository'
import { ProductService } from './services/create-product.service'

@Module({
  imports: [SharedModule, TypeOrmModule.forFeature([ProductEntity])],
  providers: [ProductsRepository, ProductService],
  controllers: [ProductController],
  exports: [ProductsRepository, ProductService]
})
export class ProductsModule {}

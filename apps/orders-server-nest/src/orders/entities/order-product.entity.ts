import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'

import { ProductEntity } from '../../products/entities/product.entity'

import { OrderEntity } from './order.entity'

@Entity('order_products')
export class OrderProductEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string

  @Column({ type: 'uuid', name: 'order_id' })
  orderID: string

  @Column({ type: 'uuid', name: 'product_id' })
  productID: string

  @Column({ type: 'integer', name: 'quantity' })
  quantity: number

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  @UpdateDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null

  @ManyToOne(() => OrderEntity, (order) => order.orderProducts)
  @JoinColumn({ name: 'order_id', referencedColumnName: 'id' })
  order: OrderEntity

  @ManyToOne(() => ProductEntity, (product) => product.orderProducts)
  @JoinColumn({ name: 'product_id', referencedColumnName: 'id' })
  product: ProductEntity
}

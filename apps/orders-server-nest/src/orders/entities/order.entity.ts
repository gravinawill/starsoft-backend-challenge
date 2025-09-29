import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'

import { CustomerEntity } from '../../users/entities/customer.entity'

import { OrderProductEntity } from './order-product.entity'

export enum OrderStatus {
  CREATED = 'CREATED', // Order created, but not yet confirmed
  INVENTORY_PRODUCTS_MISSING = 'INVENTORY_PRODUCTS_MISSING', // Inventory products are missing
  INVENTORY_CONFIRMED = 'INVENTORY_CONFIRMED', // Inventory products are confirmed
  AWAITING_PAYMENT = 'AWAITING_PAYMENT',
  PAYMENT_SUCCEEDED = 'PAYMENT_SUCCEEDED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  SHIPMENT_CREATED = 'SHIPMENT_CREATED',
  DELIVERY_FAILED = 'DELIVERY_FAILED',
  DELIVERY_COMPLETED = 'DELIVERY_COMPLETED'
}

export enum PaymentMethod {
  PIX = 'PIX'
}

@Entity('orders')
export class OrderEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string

  @Column({ type: 'varchar', length: 255, name: 'status' })
  status: OrderStatus

  @Column({ type: 'uuid', name: 'customer_id' })
  customerID: string

  @Column({ type: 'integer', name: 'total_amount_in_cents', nullable: true })
  totalAmountInCents: number | null

  @Column({ type: 'varchar', length: 255, name: 'payment_method' })
  paymentMethod: PaymentMethod

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  @UpdateDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null

  @ManyToOne(() => CustomerEntity, (customer) => customer.orders)
  @JoinColumn({ name: 'customer_id', referencedColumnName: 'id' })
  customer: CustomerEntity

  @OneToMany(() => OrderProductEntity, (orderProduct) => orderProduct.order)
  orderProducts: OrderProductEntity[]
}

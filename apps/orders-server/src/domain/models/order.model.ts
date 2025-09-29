import { type Customer } from '@models/customer.model'
import { type GenerateIDError, ID, ModelName } from '@niki/domain'
import { type Either } from '@niki/utils'
import { failure, success } from 'dist/src/utils/either.util'

import { type Product } from './product.model'

export enum OrderStatus {
  CREATED = 'CREATED',
  INVENTORY_PRODUCTS_MISSING = 'INVENTORY_PRODUCTS_MISSING',
  INVENTORY_CONFIRMED = 'INVENTORY_CONFIRMED',
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

export type OrderProduct = {
  product: Pick<Product, 'id'>
  quantity: number
}

export class Order {
  public readonly id: ID
  public status: OrderStatus
  public customer: Pick<Customer, 'id'>
  public totalAmountInCents: number | null
  public paymentMethod: PaymentMethod
  public products: OrderProduct[]
  public readonly createdAt: Date
  public updatedAt: Date
  public deletedAt: Date | null

  constructor(parameters: {
    id: ID
    status: OrderStatus
    customer: Pick<Customer, 'id'>
    totalAmountInCents: number | null
    paymentMethod: PaymentMethod
    products: OrderProduct[]
    createdAt: Date
    updatedAt: Date
    deletedAt: Date | null
  }) {
    this.id = parameters.id
    this.status = parameters.status
    this.customer = parameters.customer
    this.totalAmountInCents = parameters.totalAmountInCents
    this.paymentMethod = parameters.paymentMethod
    this.products = parameters.products
    this.createdAt = parameters.createdAt
    this.updatedAt = parameters.updatedAt
    this.deletedAt = parameters.deletedAt
  }

  public static create(parameters: {
    customer: Pick<Customer, 'id'>
    paymentMethod: PaymentMethod
    products: OrderProduct[]
  }): Either<GenerateIDError, { orderCreated: Order }> {
    const resultGenerateID = ID.generate({ modelName: ModelName.ORDER })
    if (resultGenerateID.isFailure()) return failure(resultGenerateID.value)

    const { idGenerated: orderID } = resultGenerateID.value
    const now = new Date()
    const order = new Order({
      id: orderID,
      status: OrderStatus.CREATED,
      customer: parameters.customer,
      totalAmountInCents: null,
      paymentMethod: parameters.paymentMethod,
      products: parameters.products,
      createdAt: now,
      updatedAt: now,
      deletedAt: null
    })

    return success({ orderCreated: order })
  }
}

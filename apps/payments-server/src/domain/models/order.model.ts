import { type Customer } from '@models/customer.model'
import { type ID, InvalidOrderPaymentMethodError, InvalidOrderStatusError } from '@niki/domain'
import { type Either } from '@niki/utils'
import { failure, success } from '@niki/utils'

export enum OrderStatus {
  CREATED = 'CREATED',
  AWAITING_PAYMENT = 'AWAITING_PAYMENT',
  PAYMENT_SUCCEEDED = 'PAYMENT_SUCCEEDED',
  PAYMENT_FAILED = 'PAYMENT_FAILED'
}

export enum PaymentMethod {
  PIX = 'PIX'
}

export class Order {
  public readonly id: ID
  public status: OrderStatus
  public customer: Pick<Customer, 'id'>
  public totalAmountInCents: number | null
  public paymentMethod: PaymentMethod
  public readonly createdAt: Date
  public updatedAt: Date
  public deletedAt: Date | null

  constructor(parameters: {
    id: ID
    status: OrderStatus
    customer: Pick<Customer, 'id'>
    totalAmountInCents: number | null
    paymentMethod: PaymentMethod
    createdAt: Date
    updatedAt: Date
    deletedAt: Date | null
  }) {
    this.id = parameters.id
    this.status = parameters.status
    this.customer = parameters.customer
    this.totalAmountInCents = parameters.totalAmountInCents
    this.paymentMethod = parameters.paymentMethod
    this.createdAt = parameters.createdAt
    this.updatedAt = parameters.updatedAt
    this.deletedAt = parameters.deletedAt
  }

  public static create(parameters: {
    orderID: ID
    customer: Pick<Customer, 'id'>
    paymentMethod: PaymentMethod
    createdAt: Date
    updatedAt: Date
  }): { orderCreated: Order } {
    const order = new Order({
      id: parameters.orderID,
      status: OrderStatus.CREATED,
      customer: parameters.customer,
      paymentMethod: parameters.paymentMethod,
      createdAt: parameters.createdAt,
      updatedAt: parameters.updatedAt,
      totalAmountInCents: null,
      deletedAt: null
    })
    return { orderCreated: order }
  }

  public static validateStatus(parameters: {
    status: string
  }): Either<InvalidOrderStatusError, { statusValidated: OrderStatus }> {
    if (!Object.values(OrderStatus).includes(parameters.status as OrderStatus)) {
      return failure(new InvalidOrderStatusError({ orderStatus: parameters.status }))
    }
    return success({ statusValidated: parameters.status as OrderStatus })
  }

  public static validatePaymentMethod(parameters: {
    paymentMethod: string
  }): Either<InvalidOrderPaymentMethodError, { paymentMethodValidated: PaymentMethod }> {
    if (!Object.values(PaymentMethod).includes(parameters.paymentMethod.toUpperCase() as PaymentMethod)) {
      return failure(new InvalidOrderPaymentMethodError({ orderPaymentMethod: parameters.paymentMethod }))
    }
    return success({ paymentMethodValidated: parameters.paymentMethod.toUpperCase() as PaymentMethod })
  }

  public static updateStatusAfterCreateBilling(parameters: { order: Pick<Order, 'id' | 'totalAmountInCents'> }): {
    orderUpdated: Pick<Order, 'id' | 'status' | 'updatedAt' | 'totalAmountInCents'>
  } {
    return {
      orderUpdated: {
        id: parameters.order.id,
        status: OrderStatus.AWAITING_PAYMENT,
        updatedAt: new Date(),
        totalAmountInCents: parameters.order.totalAmountInCents
      }
    }
  }

  public static updateStatusAfterPaidBillingWithSuccess(parameters: { order: Pick<Order, 'id'> }): {
    orderUpdated: Pick<Order, 'id' | 'status' | 'updatedAt'>
  } {
    return {
      orderUpdated: { id: parameters.order.id, status: OrderStatus.PAYMENT_SUCCEEDED, updatedAt: new Date() }
    }
  }

  public static updateStatusAfterPaidBillingWithFailure(parameters: { order: Pick<Order, 'id'> }): {
    orderUpdated: Pick<Order, 'id' | 'status' | 'updatedAt'>
  } {
    return {
      orderUpdated: { id: parameters.order.id, status: OrderStatus.PAYMENT_FAILED, updatedAt: new Date() }
    }
  }
}

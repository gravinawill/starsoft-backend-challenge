import { type GenerateIDError, ID, InvalidBillingStatusError, ModelName } from '@niki/domain'
import { type Either, failure, success } from '@niki/utils'

import { type Customer } from './customer.model'
import { type Order, type PaymentMethod } from './order.model'

export enum PaymentGateway {
  ABACATE_PAY = 'ABACATE_PAY'
}

export enum BillingStatus {
  PENDING = 'PENDING',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED'
}

export class Billing {
  public readonly id: ID
  public order: Pick<Order, 'id'>
  public customer: Pick<Customer, 'id'>
  public status: BillingStatus
  public paymentURL: string | null

  public amountInCents: number
  public paymentMethod: PaymentMethod
  public paymentAt: Date | null

  public paymentGateway: PaymentGateway
  public paymentGatewayBillingID: string

  public readonly createdAt: Date
  public updatedAt: Date
  public deletedAt: Date | null

  constructor(parameters: {
    id: ID
    order: Pick<Order, 'id'>
    customer: Pick<Customer, 'id'>
    status: BillingStatus
    paymentURL: string | null
    amountInCents: number
    paymentMethod: PaymentMethod
    paymentAt: Date | null
    paymentGateway: PaymentGateway
    paymentGatewayBillingID: string
    createdAt: Date
    updatedAt: Date
    deletedAt: Date | null
  }) {
    this.id = parameters.id
    this.order = parameters.order
    this.customer = parameters.customer
    this.status = parameters.status
    this.paymentURL = parameters.paymentURL
    this.amountInCents = parameters.amountInCents
    this.paymentMethod = parameters.paymentMethod
    this.paymentAt = parameters.paymentAt
    this.createdAt = parameters.createdAt
    this.updatedAt = parameters.updatedAt
    this.deletedAt = parameters.deletedAt
    this.paymentGateway = parameters.paymentGateway
    this.paymentGatewayBillingID = parameters.paymentGatewayBillingID
  }

  public static create(parameters: {
    orderID: ID
    customerID: ID
    paymentURL: string | null
    amountInCents: number
    paymentMethod: PaymentMethod
    paymentGateway: PaymentGateway
    paymentGatewayBillingID: string
  }): Either<GenerateIDError, { billingCreated: Billing }> {
    const resultGenerateID = ID.generate({ modelName: ModelName.BILLING })
    if (resultGenerateID.isFailure()) return failure(resultGenerateID.value)

    const { idGenerated: billingID } = resultGenerateID.value
    const now = new Date()
    const billing = new Billing({
      id: billingID,
      order: { id: parameters.orderID },
      customer: { id: parameters.customerID },
      status: BillingStatus.PENDING,
      paymentURL: parameters.paymentURL,
      amountInCents: parameters.amountInCents,
      paymentMethod: parameters.paymentMethod,
      paymentAt: null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      paymentGateway: parameters.paymentGateway,
      paymentGatewayBillingID: parameters.paymentGatewayBillingID
    })

    return success({ billingCreated: billing })
  }

  public static updateStatusAfterPaidBillingWithSuccess(parameters: {
    billing: Pick<Billing, 'id' | 'amountInCents' | 'paymentMethod'>
  }): {
    billingUpdated: Pick<Billing, 'id' | 'status' | 'updatedAt' | 'amountInCents' | 'paymentMethod'> & {
      paymentAt: Date
    }
  } {
    const now = new Date()
    return {
      billingUpdated: {
        id: parameters.billing.id,
        status: BillingStatus.PAID,
        updatedAt: now,
        amountInCents: parameters.billing.amountInCents,
        paymentMethod: parameters.billing.paymentMethod,
        paymentAt: now
      }
    }
  }

  public static updateStatusAfterPaidBillingWithFailure(parameters: { billing: Pick<Billing, 'id'> }): {
    billingUpdated: Pick<Billing, 'id' | 'status' | 'updatedAt'>
  } {
    return {
      billingUpdated: { id: parameters.billing.id, status: BillingStatus.REFUNDED, updatedAt: new Date() }
    }
  }

  public static validateStatus(parameters: {
    billing: {
      status: string
      id: ID
    }
  }): Either<InvalidBillingStatusError, { statusValidated: BillingStatus }> {
    if (!Object.values(BillingStatus).includes(parameters.billing.status as BillingStatus)) {
      return failure(
        new InvalidBillingStatusError({ orderStatus: parameters.billing.status, billingID: parameters.billing.id })
      )
    }
    return success({ statusValidated: parameters.billing.status as BillingStatus })
  }
}

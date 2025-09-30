import { PaymentGateway } from '@models/billing.model'
import { type ILoggerProvider, ProviderError } from '@niki/domain'
import { failure, success } from '@niki/utils'
import {
  type CreateBillingPaymentGatewayProviderDTO,
  type ICreateBillingPaymentGatewayProvider
} from '@providers-contracts/payment-gateway/create-billing.payment-gateway-provider'

interface AbacatePayProduct {
  externalId: string
  name: string
  description: string
  quantity: number
  price: number
}

interface AbacatePayCustomer {
  name: string
  cellphone: string
  email: string
  taxId: string
}

interface AbacatePayBillingRequest {
  frequency: 'ONE_TIME'
  methods: string[]
  products: AbacatePayProduct[]
  returnUrl: string
  completionUrl: string
  customerId: string
  customer: AbacatePayCustomer
  allowCoupons: boolean
  coupons: string[]
  externalId: string
}

interface AbacatePayBillingResponse {
  id: string
  paymentUrl: string
  status: string
}

export class AbacatePayPaymentGatewayProvider implements ICreateBillingPaymentGatewayProvider {
  constructor(
    private readonly config: {
      API_URL: string
      API_TOKEN: string
      BILLING_RETURN_URL: string
      BILLING_COMPLETION_URL: string
    },
    private readonly loggerProvider: ILoggerProvider
  ) {}

  public async createBilling(
    parameters: CreateBillingPaymentGatewayProviderDTO.Parameters
  ): CreateBillingPaymentGatewayProviderDTO.Result {
    try {
      this.loggerProvider.sendLogInfo({
        message: '[AbacatePay] Creating billing request ${parameters.billing.order.id.value}',
        data: { parameters }
      })

      const abacatePayRequest: AbacatePayBillingRequest = {
        frequency: 'ONE_TIME',
        methods: [parameters.billing.paymentMethod],
        products: [
          {
            externalId: parameters.billing.order.id.value,
            name: 'Order Payment',
            description: `Payment for order ${parameters.billing.order.id.value}`,
            quantity: 1,
            price: parameters.billing.amountInCents
          }
        ],
        returnUrl: this.config.BILLING_RETURN_URL,
        completionUrl: this.config.BILLING_COMPLETION_URL,
        customerId: parameters.billing.customer.id.value,
        customer: {
          name: 'Customer', // This should come from customer data
          cellphone: '11999999999', // This should come from customer data
          email: 'customer@example.com', // This should come from customer data
          taxId: '12345678901' // This should come from customer data
        },
        allowCoupons: false,
        coupons: [],
        externalId: parameters.billing.order.id.value
      }

      this.loggerProvider.sendLogInfo({
        message: '[AbacatePay] Sending request to AbacatePay API',
        data: { abacatePayRequest }
      })

      const response = await fetch(`${this.config.API_URL}/billing/create`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.config.API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(abacatePayRequest)
      })

      this.loggerProvider.sendLogInfo({
        message: '[AbacatePay] Received response from AbacatePay API',
        data: {
          status: response.status,
          statusText: response.statusText
        }
      })

      if (!response.ok) {
        this.loggerProvider.sendLogError({
          message: '[AbacatePay] AbacatePay API error',
          value: {
            status: response.status,
            statusText: response.statusText
          }
        })
        return failure(
          new ProviderError({
            error: new Error(`AbacatePay API error: ${response.status} ${response.statusText}`),
            provider: {
              name: 'abacate-pay',
              method: 'create billing',
              externalName: 'abacate-pay-api'
            }
          })
        )
      }

      const data: AbacatePayBillingResponse = await response.json()

      this.loggerProvider.sendLogInfo({
        message: '[AbacatePay] Billing created successfully',
        data: {
          paymentGatewayBillingID: data.id,
          paymentURL: data.paymentUrl
        }
      })

      return success({
        billingCreatedByPaymentGateway: {
          paymentGatewayBillingID: data.id,
          paymentGateway: PaymentGateway.ABACATE_PAY,
          paymentURL: data.paymentUrl
        }
      })
    } catch (error) {
      this.loggerProvider.sendLogError({
        message: '[AbacatePay] Error creating billing',
        value: {
          error: error instanceof Error ? error.message : String(error)
        }
      })
      return failure(
        new ProviderError({
          error: error instanceof Error ? error : new Error(String(error)),
          provider: {
            name: 'abacate-pay',
            method: 'create billing',
            externalName: 'abacate-pay-api'
          }
        })
      )
    }
  }
}

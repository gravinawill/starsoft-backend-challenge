import { AbacatePayPaymentGatewayProvider } from '@infra/providers/payment-gateways/abacate-pay.payment-gateway-provider'
import { paymentsServerENV } from '@niki/env'
import { makeLoggerProvider } from '@niki/logger'
import { type ICreateBillingPaymentGatewayProvider } from '@providers-contracts/payment-gateway/create-billing.payment-gateway-provider'

export const makePaymentGatewayProvider = (): ICreateBillingPaymentGatewayProvider => {
  return new AbacatePayPaymentGatewayProvider(
    {
      API_URL: paymentsServerENV.ABACATE_PAY_API_URL,
      API_TOKEN: paymentsServerENV.ABACATE_PAY_API_TOKEN,
      BILLING_RETURN_URL: paymentsServerENV.PAYMENTS_SERVER_BILLING_RETURN_URL,
      BILLING_COMPLETION_URL: paymentsServerENV.PAYMENTS_SERVER_BILLING_COMPLETION_URL
    },
    makeLoggerProvider()
  )
}

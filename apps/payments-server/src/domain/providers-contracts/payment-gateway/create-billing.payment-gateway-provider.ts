import { type Billing } from '@models/billing.model'
import { type ProviderError } from '@niki/domain'
import { type Either } from '@niki/utils'

export namespace CreateBillingPaymentGatewayProviderDTO {
  export type Parameters = Readonly<{
    billing: Pick<Billing, 'amountInCents' | 'paymentMethod' | 'order' | 'customer'>
  }>

  export type ResultFailure = Readonly<ProviderError>
  export type ResultSuccess = Readonly<{
    billingCreatedByPaymentGateway: Pick<Billing, 'paymentGatewayBillingID' | 'paymentGateway' | 'paymentURL'>
  }>

  export type Result = Promise<Either<ResultFailure, ResultSuccess>>
}

export interface ICreateBillingPaymentGatewayProvider {
  createBilling(
    parameters: CreateBillingPaymentGatewayProviderDTO.Parameters
  ): CreateBillingPaymentGatewayProviderDTO.Result
}

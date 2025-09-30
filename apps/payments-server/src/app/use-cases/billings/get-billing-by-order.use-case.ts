import type { Customer } from '@models/customer.model'

import { type Billing } from '@models/billing.model'
import {
  BillingNotFoundError,
  ID,
  type InvalidBillingStatusError,
  type InvalidIDError,
  type InvalidOrderStatusError,
  type ISendLogErrorLoggerProvider,
  type ISendLogTimeUseCaseLoggerProvider,
  ModelName,
  type RepositoryError,
  UseCase
} from '@niki/domain'
import { type Either, failure, success } from '@niki/utils'
import { type IFindBillingByOrderBillingsRepository } from '@repository-contracts/billings/find-billing-by-order.billings-repository'

export namespace GetBillingByOrderUseCaseDTO {
  export type Parameters = Readonly<{
    customer: Pick<Customer, 'id'>
    orderID: string
  }>

  export type ResultFailure = Readonly<
    RepositoryError | InvalidIDError | InvalidOrderStatusError | InvalidBillingStatusError | BillingNotFoundError
  >
  export type ResultSuccess = Readonly<{
    billingFound: Pick<Billing, 'id' | 'status' | 'paymentURL' | 'amountInCents' | 'paymentMethod' | 'createdAt'>
    message: string
  }>

  export type Result = Promise<Either<ResultFailure, ResultSuccess>>
}

export class GetBillingByOrderUseCase extends UseCase<
  GetBillingByOrderUseCaseDTO.Parameters,
  GetBillingByOrderUseCaseDTO.ResultFailure,
  GetBillingByOrderUseCaseDTO.ResultSuccess
> {
  constructor(
    loggerProvider: ISendLogTimeUseCaseLoggerProvider & ISendLogErrorLoggerProvider,
    private readonly billingsRepository: IFindBillingByOrderBillingsRepository
  ) {
    super(loggerProvider)
  }

  protected async performOperation(
    parameters: GetBillingByOrderUseCaseDTO.Parameters
  ): GetBillingByOrderUseCaseDTO.Result {
    const resultValidateOrderID = ID.validate({ id: parameters.orderID, modelName: ModelName.ORDER })
    if (resultValidateOrderID.isFailure()) return failure(resultValidateOrderID.value)
    const { idValidated: orderID } = resultValidateOrderID.value

    const resultFindBillingByOrderID = await this.billingsRepository.findByOrder({ order: { id: orderID } })
    if (resultFindBillingByOrderID.isFailure()) return failure(resultFindBillingByOrderID.value)
    const { foundBilling } = resultFindBillingByOrderID.value
    if (foundBilling === null) return failure(new BillingNotFoundError({ billingID: parameters.orderID }))

    if (!foundBilling.customer.id.equals({ otherID: parameters.customer.id })) {
      return failure(new BillingNotFoundError({ billingID: parameters.orderID }))
    }

    return success({
      billingFound: foundBilling,
      message: `Billing (ID: ${foundBilling.id.value}) successfully created for Order (ID: ${orderID.value}).`
    })
  }
}

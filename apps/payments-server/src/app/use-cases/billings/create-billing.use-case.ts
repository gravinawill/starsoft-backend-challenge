import { Billing } from '@models/billing.model'
import { Order } from '@models/order.model'
import {
  BillingAlreadyExistsError,
  type GenerateIDError,
  ID,
  type InvalidBillingStatusError,
  type InvalidIDError,
  type InvalidOrderPaymentMethodError,
  type InvalidOrderStatusError,
  type ISendLogErrorLoggerProvider,
  type ISendLogTimeUseCaseLoggerProvider,
  ModelName,
  OrderNotFoundError,
  type ProviderError,
  type RepositoryError,
  UseCase
} from '@niki/domain'
import { type Either, failure, success } from '@niki/utils'
import { type ICreateBillingPaymentGatewayProvider } from '@providers-contracts/payment-gateway/create-billing.payment-gateway-provider'
import { type IFindBillingByOrderBillingsRepository } from '@repository-contracts/billings/find-billing-by-order.billings-repository'
import { type ISaveAndUpdateOrderBillingsRepository } from '@repository-contracts/billings/save-and-update-order.billings-repository'
import { type IFindOrderByIDOrdersRepository } from '@repository-contracts/orders/find-order-by-id.orders-repository'

export namespace CreateBillingUseCaseDTO {
  export type Parameters = Readonly<{
    order: {
      id: string
      totalAmountInCents: number
    }
  }>

  export type ResultFailure = Readonly<
    | InvalidIDError
    | RepositoryError
    | OrderNotFoundError
    | ProviderError
    | GenerateIDError
    | BillingAlreadyExistsError
    | InvalidOrderStatusError
    | InvalidBillingStatusError
    | InvalidOrderPaymentMethodError
  >
  export type ResultSuccess = Readonly<{ billingCreated: Billing; message: string }>

  export type Result = Promise<Either<ResultFailure, ResultSuccess>>
}

export class CreateBillingUseCase extends UseCase<
  CreateBillingUseCaseDTO.Parameters,
  CreateBillingUseCaseDTO.ResultFailure,
  CreateBillingUseCaseDTO.ResultSuccess
> {
  constructor(
    loggerProvider: ISendLogTimeUseCaseLoggerProvider & ISendLogErrorLoggerProvider,
    private readonly ordersRepository: IFindOrderByIDOrdersRepository,
    private readonly billingsRepository: IFindBillingByOrderBillingsRepository & ISaveAndUpdateOrderBillingsRepository,
    private readonly paymentGateway: ICreateBillingPaymentGatewayProvider
  ) {
    super(loggerProvider)
  }

  protected async performOperation(parameters: CreateBillingUseCaseDTO.Parameters): CreateBillingUseCaseDTO.Result {
    const resultValidateOrderID = ID.validate({ id: parameters.order.id, modelName: ModelName.ORDER })
    if (resultValidateOrderID.isFailure()) return failure(resultValidateOrderID.value)
    const { idValidated: orderID } = resultValidateOrderID.value

    const resultValidateOrderIDFromDB = await this.ordersRepository.findByID({ order: { id: orderID } })
    if (resultValidateOrderIDFromDB.isFailure()) return failure(resultValidateOrderIDFromDB.value)
    const { foundOrder } = resultValidateOrderIDFromDB.value
    if (foundOrder === null) return failure(new OrderNotFoundError({ orderID: orderID }))

    const resultFindBillingByOrderID = await this.billingsRepository.findByOrder({ order: { id: orderID } })
    if (resultFindBillingByOrderID.isFailure()) return failure(resultFindBillingByOrderID.value)
    const { foundBilling } = resultFindBillingByOrderID.value
    if (foundBilling !== null) return failure(new BillingAlreadyExistsError({ billingID: foundBilling.id }))

    const resultCreateBillingByPaymentGateway = await this.paymentGateway.createBilling({
      billing: {
        amountInCents: parameters.order.totalAmountInCents,
        paymentMethod: foundOrder.paymentMethod,
        order: foundOrder,
        customer: foundOrder.customer
      }
    })
    if (resultCreateBillingByPaymentGateway.isFailure()) return failure(resultCreateBillingByPaymentGateway.value)
    const { billingCreatedByPaymentGateway } = resultCreateBillingByPaymentGateway.value

    const resultCreateBilling = Billing.create({
      orderID: orderID,
      customerID: foundOrder.customer.id,
      paymentURL: billingCreatedByPaymentGateway.paymentURL,
      amountInCents: parameters.order.totalAmountInCents,
      paymentMethod: foundOrder.paymentMethod,
      paymentGateway: billingCreatedByPaymentGateway.paymentGateway,
      paymentGatewayBillingID: billingCreatedByPaymentGateway.paymentGatewayBillingID
    })
    if (resultCreateBilling.isFailure()) return failure(resultCreateBilling.value)
    const { billingCreated } = resultCreateBilling.value

    const { orderUpdated } = Order.updateStatusAfterCreateBilling({
      order: { id: orderID, totalAmountInCents: parameters.order.totalAmountInCents }
    })

    const resultSaveBilling = await this.billingsRepository.save({
      billing: billingCreated,
      order: orderUpdated
    })
    if (resultSaveBilling.isFailure()) return failure(resultSaveBilling.value)

    return success({
      billingCreated,
      message: `Billing (ID: ${billingCreated.id.value}) successfully created for Order (ID: ${orderID.value}).`
    })
  }
}

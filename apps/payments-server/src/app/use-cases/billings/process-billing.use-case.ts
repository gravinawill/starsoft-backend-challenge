import { Billing, BillingStatus } from '@models/billing.model'
import { Order } from '@models/order.model'
import {
  BillingNotFoundError,
  InvalidBillingStatusError,
  type InvalidIDError,
  type ISendLogErrorLoggerProvider,
  type ISendLogTimeUseCaseLoggerProvider,
  type RepositoryError,
  UseCase
} from '@niki/domain'
import { type Either, failure, success } from '@niki/utils'
import { type IFindBillingByExternalIDBillingsRepository } from '@repository-contracts/billings/find-billing-by-external-id.billings-repository'
import { type IUpdateStatusAndUpdateOrderBillingsRepository } from '@repository-contracts/billings/update-status-and-update-order.billings-repository'

export namespace ProcessBillingUseCaseDTO {
  export type Parameters = Readonly<{ paymentGatewayBilling: { id: string; status: string } }>

  export type ResultFailure = Readonly<
    RepositoryError | BillingNotFoundError | InvalidIDError | InvalidBillingStatusError
  >
  export type ResultSuccess = Readonly<{
    message: string
    billingUpdated: Pick<Billing, 'id' | 'customer' | 'status' | 'updatedAt' | 'amountInCents' | 'paymentMethod'> & {
      paymentAt: Date
      order: Pick<Order, 'id' | 'status' | 'updatedAt'>
    }
  }>

  export type Result = Promise<Either<ResultFailure, ResultSuccess>>
}

export class ProcessBillingUseCase extends UseCase<
  ProcessBillingUseCaseDTO.Parameters,
  ProcessBillingUseCaseDTO.ResultFailure,
  ProcessBillingUseCaseDTO.ResultSuccess
> {
  constructor(
    loggerProvider: ISendLogTimeUseCaseLoggerProvider & ISendLogErrorLoggerProvider,
    private readonly billingsRepository: IFindBillingByExternalIDBillingsRepository &
      IUpdateStatusAndUpdateOrderBillingsRepository
  ) {
    super(loggerProvider)
  }

  protected async performOperation(parameters: ProcessBillingUseCaseDTO.Parameters): ProcessBillingUseCaseDTO.Result {
    const resultFindBilling = await this.billingsRepository.findByExternalID({
      billing: { paymentGatewayBillingID: parameters.paymentGatewayBilling.id }
    })
    if (resultFindBilling.isFailure()) return failure(resultFindBilling.value)
    const { foundBilling } = resultFindBilling.value
    if (!foundBilling) return failure(new BillingNotFoundError({ externalID: parameters.paymentGatewayBilling.id }))
    const statusValidationResult = Billing.validateStatus({
      billing: { status: parameters.paymentGatewayBilling.status, id: foundBilling.id }
    })
    if (statusValidationResult.isFailure()) return failure(statusValidationResult.value)
    const billingStatus = statusValidationResult.value.statusValidated
    return this.processBillingStatusUpdate({ billing: foundBilling, newStatus: billingStatus })
  }

  private async processBillingStatusUpdate(parameters: {
    billing: Pick<Billing, 'id' | 'order' | 'status' | 'customer' | 'amountInCents' | 'paymentMethod'> & {
      order: Pick<Order, 'id' | 'status' | 'updatedAt'>
    }
    newStatus: BillingStatus
  }): ProcessBillingUseCaseDTO.Result {
    switch (parameters.newStatus) {
      case BillingStatus.PAID: {
        return this.processPaidBilling(parameters.billing)
      }

      case BillingStatus.EXPIRED: {
        //TODO: Implement expired billing
        return failure(
          new InvalidBillingStatusError({ orderStatus: parameters.newStatus, billingID: parameters.billing.id })
        )
      }

      // eslint-disable-next-line sonarjs/no-duplicated-branches -- different cases
      case BillingStatus.CANCELLED: {
        return failure(
          new InvalidBillingStatusError({ orderStatus: parameters.newStatus, billingID: parameters.billing.id })
        )
      }

      // eslint-disable-next-line sonarjs/no-duplicated-branches -- different cases
      case BillingStatus.REFUNDED: {
        return failure(
          new InvalidBillingStatusError({ orderStatus: parameters.newStatus, billingID: parameters.billing.id })
        )
      }

      // eslint-disable-next-line sonarjs/no-duplicated-branches -- different cases
      case BillingStatus.PENDING: {
        return failure(
          new InvalidBillingStatusError({ orderStatus: parameters.newStatus, billingID: parameters.billing.id })
        )
      }

      // eslint-disable-next-line sonarjs/no-duplicated-branches -- different cases
      default: {
        return failure(
          new InvalidBillingStatusError({ orderStatus: parameters.newStatus, billingID: parameters.billing.id })
        )
      }
    }
  }

  private async processPaidBilling(
    billing: Pick<Billing, 'id' | 'order' | 'status' | 'customer' | 'amountInCents' | 'paymentMethod'> & {
      order: Pick<Order, 'id' | 'status' | 'updatedAt'>
    }
  ): ProcessBillingUseCaseDTO.Result {
    const { orderUpdated } = Order.updateStatusAfterPaidBillingWithSuccess({
      order: { id: billing.order.id }
    })
    const { billingUpdated } = Billing.updateStatusAfterPaidBillingWithSuccess({
      billing: {
        id: billing.id,
        amountInCents: billing.amountInCents,
        paymentMethod: billing.paymentMethod
      }
    })
    const updateResult = await this.billingsRepository.updateStatusAndOrder({
      billing: billingUpdated,
      order: orderUpdated
    })

    if (updateResult.isFailure()) return failure(updateResult.value)

    return success({
      message: `Billing (ID: ${billing.id.value}) successfully processed and marked as PAID.`,
      billingUpdated: {
        id: billing.id,
        customer: billing.customer,
        order: {
          id: billing.order.id,
          status: orderUpdated.status,
          updatedAt: orderUpdated.updatedAt
        },
        status: billingUpdated.status,
        updatedAt: billingUpdated.updatedAt,
        amountInCents: billingUpdated.amountInCents,
        paymentMethod: billingUpdated.paymentMethod,
        paymentAt: billingUpdated.paymentAt
      }
    })
  }
}

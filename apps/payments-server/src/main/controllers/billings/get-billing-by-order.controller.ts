import { makeGetBillingByOrderUseCase } from '@factories/use-cases/billings/get-billing-by-order-use-case.factory'
import { makeAuthenticateCustomerUseCase } from '@factories/use-cases/customers/authenticate-customer-use-case.factory'
import { type RouteHandler } from '@hono/zod-openapi'
import {
  getHttpStatusCodeByStatusError,
  getHttpStatusCodeByStatusSuccess,
  STATUS_ERROR,
  STATUS_SUCCESS
} from '@niki/domain'
import { makeLoggerProvider } from '@niki/logger'
import {
  type getBillingByOrderRoute,
  GetBillingErrorResponseSchema,
  GetBillingSuccessResponseSchema
} from '@routes/billings/get-billing.route'

export const getBillingByOrderController: RouteHandler<typeof getBillingByOrderRoute> = async (c) => {
  const logger = makeLoggerProvider()
  try {
    const { orderID } = c.req.valid('param')

    const resultAuthenticateCustomer = await makeAuthenticateCustomerUseCase().execute({
      bearerToken: c.req.header('Authorization')
    })

    if (resultAuthenticateCustomer.isFailure()) {
      return c.json(
        GetBillingErrorResponseSchema.parse({
          success: null,
          error: { name: resultAuthenticateCustomer.value.name, message: resultAuthenticateCustomer.value.errorMessage }
        }),
        getHttpStatusCodeByStatusError({ status: resultAuthenticateCustomer.value.status }).statusCode as never
      )
    }

    const getBillingByOrderUseCase = makeGetBillingByOrderUseCase()
    const result = await getBillingByOrderUseCase.execute({
      customer: { id: resultAuthenticateCustomer.value.customer.id },
      orderID
    })

    if (result.isFailure()) {
      logger.sendLogError({
        message: 'Error retrieving billing by order',
        value: { error: result.value }
      })
      return c.json(
        GetBillingErrorResponseSchema.parse({
          success: null,
          error: { name: result.value.name, message: result.value.errorMessage }
        }),
        getHttpStatusCodeByStatusError({ status: result.value.status }).statusCode as never
      )
    }

    return c.json(
      GetBillingSuccessResponseSchema.parse({
        success: {
          data: { billing: result.value.billingFound },
          message: 'Billing retrieved successfully'
        },
        error: null
      }),
      getHttpStatusCodeByStatusSuccess({ status: STATUS_SUCCESS.DONE }).statusCode as never
    )
  } catch (error: unknown) {
    logger.sendLogError({
      message: 'Unexpected error in getBillingByOrderController',
      value: { error }
    })
    return c.json(
      GetBillingErrorResponseSchema.parse({
        success: null,
        error: { name: 'InternalServerError', message: 'An unexpected error occurred while retrieving the billing' }
      }),
      getHttpStatusCodeByStatusError({ status: STATUS_ERROR.INTERNAL_ERROR }).statusCode as never
    )
  }
}

import { makeAuthenticateCustomerUseCase } from '@factories/use-cases/customers/authenticate-customer-use-case.factory'
import { makeCreateOrderUseCase } from '@factories/use-cases/orders/create-order-use-case.factory'
import { type RouteHandler } from '@hono/zod-openapi'
import { type OrdersOrderCreatedEventPayload } from '@niki/domain'
import {
  EventContractType,
  getHttpStatusCodeByStatusError,
  getHttpStatusCodeByStatusSuccess,
  STATUS_ERROR,
  STATUS_SUCCESS
} from '@niki/domain'
import { ordersServerENV } from '@niki/env'
import { makeLoggerProvider } from '@niki/logger'
import { ClientID, makeMessageBrokerProvider } from '@niki/message-broker'
import { type createOrderRoute } from '@routes/orders/create-order.route'

export const createOrderController: RouteHandler<typeof createOrderRoute> = async (c) => {
  try {
    const body = c.req.valid('json')

    const authResult = await makeAuthenticateCustomerUseCase().execute({ bearerToken: c.req.header('Authorization') })

    if (authResult.isFailure()) {
      return c.json(
        { success: null, error: { name: authResult.value.name, message: authResult.value.errorMessage } },
        getHttpStatusCodeByStatusError({ status: authResult.value.status }).statusCode as never
      )
    }

    const orderResult = await makeCreateOrderUseCase().execute({
      customer: { id: authResult.value.customer.id },
      order: { paymentMethod: body.paymentMethod, products: body.products }
    })

    if (orderResult.isFailure()) {
      return c.json(
        { success: null, error: { name: orderResult.value.name, message: orderResult.value.errorMessage } },
        getHttpStatusCodeByStatusError({ status: orderResult.value.status }).statusCode as never
      )
    }

    const { orderCreated } = orderResult.value

    await makeMessageBrokerProvider({
      brokers: [ordersServerENV.MESSAGE_BROKER_PROVIDER_BROKER_URL],
      clientID: ClientID.ORDERS_SERVER
    }).sendMessage<OrdersOrderCreatedEventPayload>({
      eventContractType: EventContractType.ORDER_CREATED,
      payload: {
        customerID: orderCreated.customer.id.value,
        orderID: orderCreated.id.value,
        paymentMethod: orderCreated.paymentMethod,
        status: orderCreated.status,
        products: orderCreated.products.map((p) => ({ id: p.product.id.value, quantity: p.quantity })),
        createdAt: orderCreated.createdAt,
        updatedAt: orderCreated.updatedAt
      }
    })

    return c.json(
      {
        success: {
          data: {
            order: {
              id: orderCreated.id.value,
              paymentMethod: orderCreated.paymentMethod,
              products: orderCreated.products.map((p) => ({
                id: p.product.id.value,
                quantity: p.quantity
              }))
            }
          },
          message: 'Order created successfully'
        },
        error: null
      },
      getHttpStatusCodeByStatusSuccess({ status: STATUS_SUCCESS.CREATED }).statusCode as never
    )
  } catch (error) {
    makeLoggerProvider().sendLogError({
      message: 'Unexpected error in createOrderController',
      value: { error }
    })
    return c.json(
      {
        success: null,
        error: { name: 'InternalServerError', message: 'An unexpected error occurred while creating the order' }
      },
      getHttpStatusCodeByStatusError({ status: STATUS_ERROR.INTERNAL_ERROR }).statusCode as never
    )
  }
}

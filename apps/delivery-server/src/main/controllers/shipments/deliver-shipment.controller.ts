import { makeAuthenticateEmployeeUseCase } from '@factories/use-cases/employees/authenticate-employee-use-case.factory'
import { makeDeliverShipmentUseCase } from '@factories/use-cases/shipments/deliver-shipment-use-case.factory'
import { type RouteHandler } from '@hono/zod-openapi'
import { EventContractType, type ShipmentsDeliveredShipmentEventPayload } from '@niki/domain'
import { deliveryServerENV } from '@niki/env'
import { makeLoggerProvider } from '@niki/logger'
import { ClientID, makeMessageBrokerProvider } from '@niki/message-broker'
import { HTTP_STATUS_CODE } from '@niki/utils'
import { type deliverShipmentRoute } from '@routes/shipments/deliver-shipment.route'
import { HTTPException } from 'hono/http-exception'

export const deliverShipmentController: RouteHandler<typeof deliverShipmentRoute> = async (c) => {
  try {
    const params = c.req.valid('param')
    const { shipmentID } = params

    const authHeader = c.req.header('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return c.json(
        {
          success: null,
          error: { name: 'AuthenticationError', message: 'Authorization header with Bearer token is required' }
        },
        HTTP_STATUS_CODE.UNAUTHORIZED
      )
    }
    const accessToken = authHeader.split(' ')[1]
    if (!accessToken) {
      return c.json(
        {
          success: null,
          error: { name: 'AuthenticationError', message: 'Valid Bearer token is required' }
        },
        HTTP_STATUS_CODE.UNAUTHORIZED
      )
    }

    const resultAuthenticateEmployee = await makeAuthenticateEmployeeUseCase().execute({ accessToken })

    if (resultAuthenticateEmployee.isFailure()) {
      return c.json(
        {
          success: null,
          error: {
            name: 'AuthenticationError',
            message: resultAuthenticateEmployee.value.errorMessage || 'Authentication failed'
          }
        },
        HTTP_STATUS_CODE.UNAUTHORIZED
      )
    }

    const result = await makeDeliverShipmentUseCase().execute({
      employee: { id: resultAuthenticateEmployee.value.employee.id },
      shipmentID
    })

    if (result.isFailure()) {
      return c.json(
        {
          success: null,
          error: { name: 'BusinessLogicError', message: result.value.errorMessage || 'Failed to deliver shipment' }
        },
        HTTP_STATUS_CODE.BAD_REQUEST
      )
    }

    const { shipmentDelivered } = result.value
    await makeMessageBrokerProvider({
      brokers: [deliveryServerENV.MESSAGE_BROKER_PROVIDER_BROKER_URL],
      clientID: ClientID.DELIVERY_SERVER
    }).sendMessage<ShipmentsDeliveredShipmentEventPayload>({
      eventContractType: EventContractType.DELIVERED_SHIPMENT,
      payload: {
        shipmentID: shipmentDelivered.id.value,
        orderID: shipmentDelivered.order.id.value,
        deliveredAt: shipmentDelivered.deliveredAt,
        customerID: shipmentDelivered.customer.id.value
      }
    })

    return c.json(
      {
        success: {
          data: {
            shipmentId: shipmentDelivered.id.value,
            status: shipmentDelivered.status,
            deliveredAt: shipmentDelivered.deliveredAt
          },
          message: 'Shipment delivered successfully'
        },
        error: null
      },
      HTTP_STATUS_CODE.OK
    )
  } catch (error) {
    if (error instanceof HTTPException) throw error
    makeLoggerProvider().sendLogError({
      message: 'Unexpected error in deliverShipmentController',
      value: { error }
    })
    return c.json(
      {
        success: null,
        error: {
          name: 'InternalServerError',
          message: 'An unexpected error occurred while delivering the shipment'
        }
      },
      HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR
    )
  }
}

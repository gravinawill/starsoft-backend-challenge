import { ProductsProductCreatedEventPayload } from '@niki/domain'

import { makeAuthenticateEmployeeUseCase } from '@factories/use-cases/employees/authenticate-employee-use-case.factory'
import { makeCreateProductUseCase } from '@factories/use-cases/products/create-product-use-case.factory'
import { type RouteHandler } from '@hono/zod-openapi'
import { EventContractType } from '@niki/domain'
import { productInventoryServerENV } from '@niki/env'
import { makeLoggerProvider } from '@niki/logger'
import { ClientID, makeMessageBrokerProvider } from '@niki/message-broker'
import { HTTP_STATUS_CODE } from '@niki/utils'
import { type createProductRoute } from '@routes/products/create-product.route'
import { HTTPException } from 'hono/http-exception'

export const createProductController: RouteHandler<typeof createProductRoute> = async (c) => {
  try {
    const body = c.req.valid('json')

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

    const result = await makeCreateProductUseCase().execute({
      employee: { id: resultAuthenticateEmployee.value.employee.id },
      product: {
        name: body.name,
        priceInCents: body.priceInCents,
        availableCount: body.availableCount
      }
    })

    if (result.isFailure()) {
      return c.json(
        {
          success: null,
          error: { name: 'BusinessLogicError', message: result.value.errorMessage || 'Failed to create product' }
        },
        HTTP_STATUS_CODE.BAD_REQUEST
      )
    }
    const { productCreated } = result.value
    await makeMessageBrokerProvider({
      brokers: [productInventoryServerENV.MESSAGE_BROKER_PROVIDER_BROKER_URL],
      clientID: ClientID.PRODUCTS_INVENTORY_SERVER
    }).sendMessage<ProductsProductCreatedEventPayload>({
      eventContractType: EventContractType.PRODUCT_CREATED,
      payload: {
        productID: productCreated.id.value,
        name: productCreated.name,
        imageURL: productCreated.imageURL,
        priceInCents: productCreated.priceInCents,
        isAvailable: productCreated.availableCount > 0,
        createdAt: productCreated.createdAt,
        updatedAt: productCreated.updatedAt
      }
    })
    return c.json(
      {
        success: {
          data: { id: productCreated.id.value, name: productCreated.name },
          message: 'Product created successfully'
        },
        error: null
      },
      HTTP_STATUS_CODE.CREATED
    )
  } catch (error) {
    if (error instanceof HTTPException) throw error
    makeLoggerProvider().sendLogError({
      message: 'Unexpected error in createProductController',
      value: { error }
    })
    return c.json(
      {
        success: null,
        error: {
          name: 'InternalServerError',
          message: 'An unexpected error occurred while creating the product'
        }
      },
      HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR
    )
  }
}

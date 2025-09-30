import { createRoute, z } from '@hono/zod-openapi'
import { BillingStatus } from '@models/billing.model'
import { PaymentMethod } from '@models/order.model'

export const BillingSchema = z.object({
  id: z.string().openapi({
    example: '01JCQ8H7G2K3L4M5N6P7Q8R9S',
    description: 'The unique billing ID (ULID format)'
  }),
  orderID: z.string().openapi({
    example: '01JCQ8H7G2K3L4M5N6P7Q8R9S',
    description: 'The unique order ID (ULID format)'
  }),
  amountInCents: z.number().openapi({
    example: 2999,
    description: 'The amount in cents'
  }),
  status: z.enum(BillingStatus).openapi({
    example: BillingStatus.PENDING,
    description: 'The status of the billing'
  }),
  url: z.string().openapi({
    example: 'https://payment-gateway.example.com/billing/01JCQ8H7G2K3L4M5N6P7Q8R9S',
    description: 'The payment URL for the billing'
  }),
  paymentMethodAvailable: z.array(z.enum(PaymentMethod)).openapi({
    example: [PaymentMethod.PIX],
    description: 'The payment methods available for the billing'
  })
})

export const GetBillingSuccessResponseSchema = z
  .object({
    success: z.object({
      data: z.object({ billing: BillingSchema }),
      message: z.string().openapi({
        example: 'Billing retrieved successfully',
        description: 'Success message'
      })
    }),
    error: z.null()
  })
  .openapi('GetBillingSuccessResponse')

export const GetBillingErrorResponseSchema = z
  .object({
    success: z.null(),
    error: z.object({
      name: z.string().openapi({ example: 'BillingNotFoundError', description: 'Error type' }),
      message: z
        .string()
        .openapi({ example: 'Billing not found for the specified order ID', description: 'Error message' })
    })
  })
  .openapi('GetBillingErrorResponse')

export const getBillingByOrderRoute = createRoute({
  method: 'get',
  path: '/billings/orders/{orderID}',
  tags: ['Billings'],
  operationId: 'get-billing-by-order',
  summary: 'Get a billing by order ID',
  description: 'Gets a billing by order ID. Requires authentication via Bearer token.',
  security: [{ bearerAuth: ['Authorization'] }],
  request: {
    headers: z.object({
      Authorization: z.string().openapi({
        example: 'Bearer <token>',
        description: 'Bearer token for authentication'
      })
    }),
    params: z.object({
      orderID: z.string().openapi({
        example: '01JCQ8H7G2K3L4M5N6P7Q8R9S',
        description: 'The unique order ID (ULID format)'
      })
    })
  },
  responses: {
    200: {
      description: 'Billing by order ID retrieved successfully',
      content: { 'application/json': { schema: GetBillingSuccessResponseSchema } }
    },
    400: {
      description: 'Invalid request - validation errors or business logic failures by order ID',
      content: { 'application/json': { schema: GetBillingErrorResponseSchema } }
    },
    401: {
      description: 'Unauthorized - invalid or missing authentication token by order ID',
      content: { 'application/json': { schema: GetBillingErrorResponseSchema } }
    },
    404: {
      description: 'Billing not found by order ID',
      content: { 'application/json': { schema: GetBillingErrorResponseSchema } }
    },
    500: {
      description: 'Internal server error by order ID',
      content: { 'application/json': { schema: GetBillingErrorResponseSchema } }
    }
  }
})

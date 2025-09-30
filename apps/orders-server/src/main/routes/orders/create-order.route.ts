import { createRoute, z } from '@hono/zod-openapi'
import { PaymentMethod } from '@models/order.model'

const CreateOrderProductSchema = z.object({
  id: z.string().min(1, 'Product ID is required').openapi({
    example: '01JCQ8H7G2K3L4M5N6P7Q8R9S',
    description: 'The unique product ID (ULID format)'
  }),
  quantity: z.number().int('Quantity must be an integer').positive('Quantity must be positive').openapi({
    example: 2,
    description: 'The quantity of the product to order'
  })
})

const CreateOrderRequestSchema = z
  .object({
    paymentMethod: z.enum(PaymentMethod).openapi({
      example: PaymentMethod.PIX,
      description: 'The payment method for the order'
    }),
    products: z
      .array(CreateOrderProductSchema)
      .min(1, 'At least one product must be included in the order')
      .openapi({
        example: [
          { id: '01JCQ8H7G2K3L4M5N6P7Q8R9S', quantity: 2 },
          { id: '01JCQ8H7G2K3L4M5N6P7Q8R9T', quantity: 1 }
        ],
        description: 'List of products to order with their quantities'
      })
  })
  .openapi('CreateOrderRequest')

const OrderProductSchema = z.object({
  id: z.string().openapi({
    example: '01JCQ8H7G2K3L4M5N6P7Q8R9S',
    description: 'The unique product ID (ULID format)'
  }),
  quantity: z.number().openapi({
    example: 2,
    description: 'The quantity ordered'
  })
})

const OrderSchema = z.object({
  id: z.string().openapi({
    example: '01JCQ8H7G2K3L4M5N6P7Q8R9S',
    description: 'The unique order ID (ULID format)'
  }),
  paymentMethod: z.enum(PaymentMethod).openapi({
    example: PaymentMethod.PIX,
    description: 'The payment method used for the order'
  }),
  products: z.array(OrderProductSchema).openapi({
    example: [{ id: '01JCQ8H7G2K3L4M5N6P7Q8R9S', quantity: 2 }],
    description: 'List of ordered products'
  })
})

const CreateOrderSuccessResponseSchema = z
  .object({
    success: z.object({
      data: z.object({ order: OrderSchema }),
      message: z.string().openapi({
        example: 'Order created successfully',
        description: 'Success message'
      })
    }),
    error: z.null()
  })
  .openapi('CreateOrderSuccessResponse')

const CreateOrderErrorResponseSchema = z
  .object({
    success: z.null(),
    error: z.object({
      name: z.string().openapi({
        example: 'ValidationError',
        description: 'Error type'
      }),
      message: z.string().openapi({
        example: 'At least one product must be included in the order',
        description: 'Error message'
      })
    })
  })
  .openapi('CreateOrderErrorResponse')

export type CreateOrderRequest = z.infer<typeof CreateOrderRequestSchema>

export const createOrderRoute = createRoute({
  method: 'post',
  path: '/orders',
  tags: ['Orders'],
  operationId: 'orders-create',
  summary: 'Create a new order',
  description:
    'Creates a new order with selected products and payment method. Requires authentication via Bearer token.',
  security: [{ bearerAuth: ['Authorization'] }],
  request: {
    body: {
      content: { 'application/json': { schema: CreateOrderRequestSchema } },
      required: true,
      description: 'Order creation payload containing payment method and products with quantities'
    }
  },
  responses: {
    201: {
      description: 'Order created successfully',
      content: { 'application/json': { schema: CreateOrderSuccessResponseSchema } }
    },
    400: {
      description: 'Invalid request - validation errors or business logic failures',
      content: { 'application/json': { schema: CreateOrderErrorResponseSchema } }
    },
    401: {
      description: 'Unauthorized - invalid or missing authentication token',
      content: { 'application/json': { schema: CreateOrderErrorResponseSchema } }
    },
    500: {
      description: 'Internal server error',
      content: { 'application/json': { schema: CreateOrderErrorResponseSchema } }
    }
  }
})

import { createRoute, z } from '@hono/zod-openapi'

const CreateProductRequestSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(255, 'Name must be 255 characters or less').openapi({
      example: 'Wireless Bluetooth Headphones',
      description: 'The name of the product. Must be a non-empty string between 1 and 255 characters.'
    }),
    priceInCents: z
      .number()
      .int('Price must be an integer')
      .positive('Price must be positive')
      .max(999_999_999, 'Price cannot exceed $9,999,999.99')
      .openapi({
        example: 9999,
        description: 'The price of the product in cents (e.g., 1000 = $10.00). Must be a positive integer.'
      }),
    availableCount: z
      .number()
      .int('Available count must be an integer')
      .min(0, 'Available count cannot be negative')
      .max(999_999, 'Available count cannot exceed 999,999')
      .openapi({
        example: 100,
        description: 'The number of items available in inventory. Must be a non-negative integer between 0 and 999,999.'
      })
  })
  .openapi('CreateProductRequest')

const CreateProductSuccessResponseSchema = z
  .object({
    success: z.object({
      data: z.object({
        id: z.string().openapi({
          example: '01JCQ8H7G2K3L4M5N6P7Q8R9S',
          description: 'The unique product ID (ULID format)'
        }),
        name: z.string().openapi({
          example: 'Wireless Bluetooth Headphones',
          description: 'The name of the product'
        })
      }),
      message: z.string().openapi({
        example: 'Product created successfully',
        description: 'Success message'
      })
    }),
    error: z.null()
  })
  .openapi('CreateProductSuccessResponse')

const CreateProductErrorResponseSchema = z
  .object({
    success: z.null(),
    error: z.object({
      name: z.string().openapi({
        example: 'ValidationError',
        description: 'Error type'
      }),
      message: z.string().openapi({
        example: 'Product name is required and must be a string',
        description: 'Error message'
      })
    })
  })
  .openapi('CreateProductErrorResponse')

const CreateProductAuthErrorResponseSchema = z
  .object({
    success: z.null(),
    error: z.object({
      name: z.string().openapi({
        example: 'AuthenticationError',
        description: 'Authentication error type'
      }),
      message: z.string().openapi({
        example: 'Authorization header with Bearer token is required',
        description: 'Authentication error message'
      })
    })
  })
  .openapi('CreateProductAuthErrorResponse')

export type CreateProductRequest = z.infer<typeof CreateProductRequestSchema>

export const createProductRoute = createRoute({
  method: 'post',
  path: '/products',
  tags: ['Products'],
  operationId: 'products-create',
  summary: 'Create a new product',
  description:
    'Creates a new product in the inventory system. Requires employee authentication via JWT Bearer token. The token must be obtained from the authentication service and included in the Authorization header.',
  security: [{ bearerAuth: ['Authorization'] }],
  request: {
    headers: z.object({
      Authorization: z.string().openapi({
        description: 'JWT Bearer token obtained from the authentication service. Format: "Bearer <token>".',
        example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      })
    }),
    body: {
      content: {
        'application/json': {
          schema: CreateProductRequestSchema
        }
      },
      required: true,
      description:
        'Product creation payload containing name, price, and initial inventory count. All fields are required and must meet validation criteria.'
    }
  },
  responses: {
    201: {
      description: 'Product created successfully',
      content: {
        'application/json': {
          schema: CreateProductSuccessResponseSchema
        }
      }
    },
    400: {
      description: 'Invalid request payload - validation errors',
      content: {
        'application/json': {
          schema: CreateProductErrorResponseSchema
        }
      }
    },
    401: {
      description: 'Unauthorized - invalid or missing JWT authentication token',
      content: {
        'application/json': {
          schema: CreateProductAuthErrorResponseSchema
        }
      }
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: CreateProductErrorResponseSchema
        }
      }
    }
  }
})

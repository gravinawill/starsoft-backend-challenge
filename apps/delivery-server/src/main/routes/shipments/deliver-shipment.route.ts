import { createRoute, z } from '@hono/zod-openapi'

const DeliverShipmentSuccessResponseSchema = z
  .object({
    success: z.object({
      data: z.object({
        shipmentId: z.string().openapi({
          example: '01JCQ8H7G2K3L4M5N6P7Q8R9S',
          description: 'The unique shipment ID (ULID format)'
        }),
        status: z.string().openapi({
          example: 'DELIVERED',
          description: 'The updated status of the shipment'
        }),
        deliveredAt: z.string().openapi({
          example: '2024-01-15T14:30:00Z',
          description: 'ISO 8601 timestamp of when the shipment was delivered'
        })
      }),
      message: z.string().openapi({
        example: 'Shipment delivered successfully',
        description: 'Success message'
      })
    }),
    error: z.null()
  })
  .openapi('DeliverShipmentSuccessResponse')

const DeliverShipmentErrorResponseSchema = z
  .object({
    success: z.null(),
    error: z.object({
      name: z.string().openapi({
        example: 'ValidationError',
        description: 'Error type'
      }),
      message: z.string().openapi({
        example: 'Invalid shipment ID format',
        description: 'Error message'
      })
    })
  })
  .openapi('DeliverShipmentErrorResponse')

const DeliverShipmentAuthErrorResponseSchema = z
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
  .openapi('DeliverShipmentAuthErrorResponse')

const DeliverShipmentNotFoundErrorResponseSchema = z
  .object({
    success: z.null(),
    error: z.object({
      name: z.string().openapi({
        example: 'NotFoundError',
        description: 'Not found error type'
      }),
      message: z.string().openapi({
        example: 'Shipment not found',
        description: 'Error message'
      })
    })
  })
  .openapi('DeliverShipmentNotFoundErrorResponse')

export const deliverShipmentRoute = createRoute({
  method: 'patch',
  path: '/shipments/{shipmentID}/deliver',
  tags: ['Shipments'],
  operationId: 'shipments-deliver',
  summary: 'Deliver a shipment',
  description:
    'Marks a shipment as delivered. Requires delivery personnel authentication via JWT Bearer token. The token must be obtained from the authentication service and included in the Authorization header.',
  security: [{ bearerAuth: ['Authorization'] }],
  request: {
    headers: z.object({
      Authorization: z.string().openapi({
        description: 'JWT Bearer token obtained from the authentication service. Format: "Bearer <token>".',
        example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      })
    }),
    params: z.object({
      shipmentID: z.string().min(1, 'Shipment ID is required').openapi({
        description: 'The unique identifier of the shipment to deliver',
        example: '01JCQ8H7G2K3L4M5N6P7Q8R9S'
      })
    })
  },
  responses: {
    200: {
      description: 'Shipment delivered successfully',
      content: {
        'application/json': {
          schema: DeliverShipmentSuccessResponseSchema
        }
      }
    },
    400: {
      description: 'Invalid request - validation errors',
      content: {
        'application/json': {
          schema: DeliverShipmentErrorResponseSchema
        }
      }
    },
    401: {
      description: 'Unauthorized - invalid or missing JWT authentication token',
      content: {
        'application/json': {
          schema: DeliverShipmentAuthErrorResponseSchema
        }
      }
    },
    404: {
      description: 'Shipment not found',
      content: {
        'application/json': {
          schema: DeliverShipmentNotFoundErrorResponseSchema
        }
      }
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: DeliverShipmentErrorResponseSchema
        }
      }
    }
  }
})

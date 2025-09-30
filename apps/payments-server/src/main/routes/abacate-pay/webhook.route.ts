import { webhookController } from '@controllers/abacate-pay/webhook.controller'
import { createRoute, type OpenAPIHono } from '@hono/zod-openapi'
import { z } from '@hono/zod-openapi'

export const WebhookRequestSchema = z
  .object({
    data: z.object({
      /*
       * payment: z.object({
       *   amount: z.number().int().openapi({
       *     example: 1000,
       *     description: 'The payment amount in cents'
       *   }),
       *   fee: z.number().int().openapi({
       *     example: 80,
       *     description: 'The payment fee in cents'
       *   }),
       *   method: z.string().openapi({
       *     example: 'PIX',
       *     description: 'The payment method'
       *   })
       * }),
       */
      billing: z.object({
        /*
         * amount: z.number().int().openapi({
         *   example: 1000,
         *   description: 'The billing amount in cents'
         * }),
         * couponsUsed: z.array(z.unknown()).openapi({
         *   example: [],
         *   description: 'Coupons used in the billing'
         * }),
         * customer: z.object({
         *   id: z.string().openapi({
         *     example: 'cust_4hnLDN3YfUWrwQBMwL6Ar',
         *     description: 'Customer ID'
         *   }),
         *   metadata: z.object({
         *     cellphone: z.string().openapi({
         *       example: '11111111111',
         *       description: 'Customer cellphone'
         *     }),
         *     email: z.string().openapi({
         *       example: 'christopher@abacatepay.com',
         *       description: 'Customer email'
         *     }),
         *     name: z.string().openapi({
         *       example: 'Christopher Ribeiro',
         *       description: 'Customer name'
         *     }),
         *     taxId: z.string().openapi({
         *       example: '12345678901',
         *       description: 'Customer tax ID'
         *     })
         *   })
         * }),
         * frequency: z.string().openapi({
         *   example: 'ONE_TIME',
         *   description: 'Billing frequency'
         * }),
         */
        id: z.string().openapi({
          example: 'bill_QgW1BT3uzaDGR3ANmabZ',
          description: 'Billing ID'
        }),
        /*
         * kind: z.array(z.string()).openapi({
         *   example: ['PIX'],
         *   description: 'Billing kind(s)'
         * }),
         * paidAmount: z.number().int().openapi({
         *   example: 1000,
         *   description: 'Paid amount in cents'
         * }),
         */
        /*
         * products: z
         *   .array(
         *     z.object({
         *       externalId: z.string().openapi({
         *         example: '123',
         *         description: 'External product ID'
         *       }),
         *       id: z.string().openapi({
         *         example: 'prod_RGKGsjBWsJwRn1mHyGMJNjP',
         *         description: 'Product ID'
         *       }),
         *       quantity: z.number().int().openapi({
         *         example: 1,
         *         description: 'Product quantity'
         *       })
         *     })
         *   )
         *   .openapi({
         *     example: [
         *       {
         *         externalId: '123',
         *         id: 'prod_RGKGsjBWsJwRn1mHyFJNjP',
         *         quantity: 1
         *       }
         *     ],
         *     description: 'List of products in the billing'
         *   }),
         */
        status: z.string().openapi({
          example: 'PAID',
          description: 'Billing status'
        })
      })
    }),
    devMode: z.boolean().openapi({
      example: false,
      description: 'Whether the webhook is in dev mode'
    }),
    event: z.string().openapi({
      example: 'billing.paid',
      description: 'The event type'
    })
  })
  .openapi('AbacatePayWebhookRequest')

export const WebhookSuccessResponseSchema = z
  .object({
    success: z.object({
      data: z.null(),
      message: z.string().openapi({
        example: 'Webhook processed successfully',
        description: 'Success message'
      })
    }),
    error: z.null()
  })
  .openapi('WebhookSuccessResponse')

export const WebhookErrorResponseSchema = z
  .object({
    success: z.null(),
    error: z.object({
      name: z.string().openapi({ example: 'WebhookError', description: 'Error type' }),
      message: z.string().openapi({ example: 'Webhook not processed successfully', description: 'Error message' })
    })
  })
  .openapi('WebhookErrorResponse')

export function abacatePayRoutes(app: OpenAPIHono): void {
  app.openapi(webhookRoute, webhookController)
}

export const webhookRoute = createRoute({
  method: 'post',
  path: '/webhook/abacatepay',
  tags: ['Abacate Pay'],
  operationId: 'webhook',
  summary: 'Webhook',
  description: 'Webhook for Abacate Pay.',
  security: [],
  request: {
    body: {
      content: { 'application/json': { schema: WebhookRequestSchema } },
      required: true,
      description: 'Webhook payload containing payment method and products with quantities'
    }
  },
  responses: {
    200: {
      description: 'Webhook processed successfully',
      content: {
        'application/json': {
          schema: WebhookSuccessResponseSchema
        }
      }
    },
    400: {
      description: 'Bad request',
      content: {
        'application/json': {
          schema: WebhookErrorResponseSchema
        }
      }
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: WebhookErrorResponseSchema
        }
      }
    }
  }
})

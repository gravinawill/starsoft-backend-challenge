import { z } from '@hono/zod-openapi'

export function stringToInteger(val: string | number): number | undefined {
  if (typeof val === 'string' && val !== '') {
    const num = Number(val)
    return Number.isInteger(num) ? num : undefined
  }
  if (typeof val === 'number') return Number.isInteger(val) ? val : undefined
  return undefined
}

export function stringToBoolean(val: string | boolean): boolean | undefined {
  if (typeof val === 'string' && val !== '' && val !== 'true' && val !== 'false') return undefined
  if (typeof val === 'string') return val === 'true'
  if (typeof val === 'boolean') return val
  return undefined
}

export const PaginationMetadataSchema = z
  .object({
    page: z.number().openapi({
      example: 1,
      description: 'Current page number'
    }),
    page_size: z.number().openapi({
      example: 20,
      description: 'Number of items per page'
    }),
    total_count: z.number().openapi({
      example: 150,
      description: 'Total number of items available'
    }),
    total_pages: z.number().openapi({
      example: 8,
      description: 'Total number of pages available'
    }),
    has_next_page: z.boolean().openapi({
      example: true,
      description: 'Whether there is a next page available'
    }),
    has_previous_page: z.boolean().openapi({
      example: false,
      description: 'Whether there is a previous page available'
    })
  })
  .openapi('PaginationMetadata')

export const ErrorResponseSchema = z
  .object({
    error: z.object({
      name: z.string().openapi({ example: 'ValidationError', description: 'Error type identifier' }),
      message: z
        .string()
        .openapi({ example: 'Invalid request parameters', description: 'Human-readable error message' })
    })
  })
  .openapi('ErrorResponse')

export const SuccessResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z
    .object({
      success: z.object({
        data: dataSchema,
        message: z.string().openapi({
          example: 'Operation completed successfully',
          description: 'Success message'
        })
      })
    })
    .openapi('SuccessResponse')

export const PaginatedSuccessResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z
    .object({
      success: z.object({
        data: dataSchema,
        message: z.string().openapi({
          example: 'Operation completed successfully',
          description: 'Success message'
        }),
        pagination: PaginationMetadataSchema.openapi({
          description: 'Pagination metadata for the results'
        })
      })
    })
    .openapi('PaginatedSuccessResponse')

export const PaginationQuerySchema = z
  .object({
    page: z
      .preprocess(stringToInteger, z.number().int().min(1, { message: 'Page must be greater than 0' }))
      .optional()
      .default(1)
      .openapi({
        example: 1,
        description: 'Page number to retrieve (starts from 1)'
      }),
    page_size: z
      .preprocess(
        stringToInteger,
        z
          .number()
          .int()
          .min(1, { message: 'Page size must be greater than 0' })
          .max(10_000, { message: 'Page size cannot exceed 10000' })
      )
      .optional()
      .default(50)
      .openapi({
        example: 20,
        description: 'Number of items per page (max 10000)'
      })
  })
  .openapi('PaginationQuery')

export const ValidationErrorResponseSchema = z
  .object({
    error: z.object({
      name: z.string().openapi({ example: 'ValidationError', description: 'Error type identifier' }),
      message: z
        .string()
        .openapi({ example: 'Invalid request parameters', description: 'Human-readable error message' }),
      details: z.array(
        z.object({
          expected: z.any().openapi({ example: '1', description: 'Expected value' }),
          code: z.string().openapi({ example: '1', description: 'Error code' }),
          path: z.string().openapi({ example: '1', description: 'Error path' }),
          message: z.string().openapi({ example: '1', description: 'Error message' })
        })
      )
    })
  })
  .openapi('ValidationErrorResponse')

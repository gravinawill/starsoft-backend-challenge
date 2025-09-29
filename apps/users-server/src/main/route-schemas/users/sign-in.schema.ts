import { schemaRegistry } from '@main/docs/openapi.docs'
import { z } from 'zod'

export const SignInRequestSchema = z
  .object({
    credentials: z
      .object({
        email: z
          .email('Please provide a valid email address')
          .toLowerCase()
          .describe("User's email address (will be converted to lowercase)")
          .register(schemaRegistry, {
            id: 'signin_email',
            title: 'Email',
            description: "User's email address for authentication (validated and normalized to lowercase)",
            example: 'john.doe@example.com'
          }),
        password: z
          .string()
          .min(8, 'Password must be at least 8 characters long')
          .max(128, 'Password must not exceed 128 characters')
          .describe("User's password for authentication")
          .register(schemaRegistry, {
            id: 'signin_password',
            title: 'Password',
            description: "User's password for authentication (8-128 characters)",
            example: 'SecurePass123!'
          })
      })
      .describe('User authentication credentials')
  })
  .register(schemaRegistry, {
    id: 'SignInRequest',
    title: 'Sign In Request',
    description: 'Request payload for user authentication with email and password credentials'
  })

export const SignInSuccessResponseSchema = z
  .object({
    success: z
      .object({
        access_token: z.string().describe('JWT access token for API authentication').register(schemaRegistry, {
          id: 'signin_access_token',
          title: 'Access Token',
          description: 'JWT access token for API authentication. Include in Authorization header as "Bearer <token>"',
          example:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
        })
      })
      .describe('Success payload containing authentication data'),
    error: z.null().describe('Error field - null for successful responses')
  })
  .register(schemaRegistry, {
    id: 'SignInSuccessResponse',
    title: 'Sign In Success Response',
    description: 'Response structure for successful user authentication with JWT token'
  })

export const SignInErrorResponseSchema = z
  .object({
    success: z.null().describe('Success field - null for error responses'),
    error: z
      .object({
        name: z.string().describe('Error type identifier for programmatic handling').register(schemaRegistry, {
          id: 'signin_error_name',
          title: 'Error Name',
          description: 'Programmatic identifier for the specific error type',
          example: 'AuthenticationError'
        }),
        message: z.string().describe('Human-readable error message for user display').register(schemaRegistry, {
          id: 'signin_error_message',
          title: 'Error Message',
          description: 'User-friendly description of what went wrong',
          example: 'Invalid email or password'
        })
      })
      .describe('Error information containing type and message')
  })
  .register(schemaRegistry, {
    id: 'SignInErrorResponse',
    title: 'Sign In Error Response',
    description: 'Response structure for failed user authentication attempts with detailed error information'
  })

export type SignInRequest = z.infer<typeof SignInRequestSchema>
export type SignInSuccessResponse = z.infer<typeof SignInSuccessResponseSchema>
export type SignInValidationErrorResponse = z.infer<typeof SignInErrorResponseSchema>
export type SignInAuthenticationErrorResponse = z.infer<typeof SignInErrorResponseSchema>
export type SignInInternalErrorResponse = z.infer<typeof SignInErrorResponseSchema>

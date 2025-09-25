import { schemaRegistry } from '@main/docs/openapi.docs'
import { UserRole } from '@niki/domain'
import { z } from 'zod'

export const SignUpRequestSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name must be at least 1 character long')
      .describe("User's full name")
      .register(schemaRegistry, {
        id: 'name',
        title: 'Name',
        description: "User's full name (minimum 1 character)",
        example: 'John Doe'
      }),
    email: z
      .email('Please provide a valid email address')
      .toLowerCase()
      .describe("User's email address (will be converted to lowercase)")
      .register(schemaRegistry, {
        id: 'email',
        title: 'Email',
        description: "User's email address (validated and normalized to lowercase)",
        example: 'john.doe@example.com'
      }),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .max(128, 'Password must not exceed 128 characters')
      .regex(/^(?=.*[a-z])/, 'Password must contain at least one lowercase letter')
      .regex(/^(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
      .regex(/^(?=.*\d)/, 'Password must contain at least one number')
      .regex(/^(?=.*[@$!%*?&])/, 'Password must contain at least one special character (@$!%*?&)')
      .describe(
        "User's password with security requirements (8-128 chars, must contain uppercase, lowercase, number, and special character)"
      )
      .register(schemaRegistry, {
        id: 'password',
        title: 'Password',
        description: 'Secure password with complexity requirements',
        example: 'SecurePass123!'
      }),
    role: z
      .enum([UserRole.CUSTOMER, UserRole.EMPLOYEE])
      .describe("User's role determining access permissions")
      .register(schemaRegistry, {
        id: 'role',
        title: 'Role',
        description: 'User role determining access permissions and capabilities',
        example: UserRole.CUSTOMER
      })
  })
  .register(schemaRegistry, {
    id: 'SignUpRequest',
    title: 'Sign Up Request',
    description: 'Request payload for user registration with comprehensive validation rules'
  })

export const SignUpSuccessResponseSchema = z
  .object({
    error: z.null().describe('Error field - null for successful responses'),
    success: z
      .object({
        access_token: z.jwt().describe('JWT access token for API authentication').register(schemaRegistry, {
          id: 'access_token',
          title: 'Access Token',
          description: 'JWT access token for API authentication. Include in Authorization header as "Bearer <token>"',
          example:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
        })
      })
      .describe('Success payload containing authentication data')
  })
  .register(schemaRegistry, {
    id: 'SignUpSuccessResponse',
    title: 'Sign Up Success Response',
    description: 'Response structure for successful user registration with JWT token'
  })

export const SignUpErrorResponseSchema = z
  .object({
    success: z.null().describe('Success field - null for error responses'),
    error: z
      .object({
        name: z.string().describe('Error type identifier for programmatic handling').register(schemaRegistry, {
          id: 'error_name',
          title: 'Error Name',
          description: 'Programmatic identifier for the specific error type',
          example: 'EmailAlreadyInUseError'
        }),
        message: z.string().describe('Human-readable error message for user display').register(schemaRegistry, {
          id: 'error_message',
          title: 'Error Message',
          description: 'User-friendly description of what went wrong',
          example: 'The email address is already registered'
        })
      })
      .describe('Error information containing type and message')
  })
  .register(schemaRegistry, {
    id: 'SignUpErrorResponse',
    title: 'Sign Up Error Response',
    description: 'Response structure for failed user registration attempts with detailed error information'
  })

export const SignUpResponsesSchema = z
  .union([SignUpSuccessResponseSchema, SignUpErrorResponseSchema])
  .describe('Union of possible sign-up response types (success or error)')
  .register(schemaRegistry, {
    id: 'SignUpResponses',
    title: 'Sign Up Responses',
    description: 'All possible response types for user registration endpoint'
  })

export type SignUpRequest = z.infer<typeof SignUpRequestSchema>
export type SignUpSuccessResponse = z.infer<typeof SignUpSuccessResponseSchema>
export type SignUpErrorResponse = z.infer<typeof SignUpErrorResponseSchema>

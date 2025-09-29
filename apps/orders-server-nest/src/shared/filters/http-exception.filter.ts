import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common'
import { FastifyReply, FastifyRequest } from 'fastify'
import { ZodError } from 'zod'

import { AppLogger } from '../logger/logger.service'

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLogger) {
    this.logger.setContext(HttpExceptionFilter.name)
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    console.log('😭exception', exception)

    const ctx = host.switchToHttp()
    const response = ctx.getResponse<FastifyReply>()
    const request = ctx.getRequest<FastifyRequest>()

    let status: number
    let errorResponse: {
      error: {
        name: string
        message: string | string[]
        issues?: unknown
      }
    }

    // Handle Zod validation errors
    if (exception instanceof ZodError) {
      status = HttpStatus.UNPROCESSABLE_ENTITY
      errorResponse = {
        error: {
          name: 'ZodValidationError',
          message: 'Validation failed',
          issues: exception.issues.map((err) => ({
            path: err.path,
            message: err.message,
            code: err.code
          }))
        }
      }

      this.logger.error({
        message: 'Zod validation error',
        meta: {
          error: errorResponse.error,
          request: {
            method: request.method,
            url: request.url,
            headers: request.headers
          }
        }
      })
    } else if (exception instanceof HttpException) {
      status = exception.getStatus()
      const exceptionResponse = exception.getResponse()

      let message: string | string[]

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as Record<string, unknown>
        message = (responseObj.message as string | string[]) || exception.message
      } else {
        message = exception.message
      }

      errorResponse = {
        error: {
          name: exception.constructor.name,
          message
        }
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR
      errorResponse = {
        error: {
          name: 'InternalServerError',
          message: 'Internal server error'
        }
      }

      // Log the unexpected error
      this.logger.error({
        message: 'Unexpected error occurred',
        meta: {
          error: exception,
          request: {
            method: request.method,
            url: request.url,
            headers: request.headers
          }
        }
      })
    }

    // Log the error response
    this.logger.error({
      message: `HTTP Exception: ${status}`,
      meta: {
        error: errorResponse.error,
        request: {
          method: request.method,
          url: request.url
        }
      }
    })

    response.status(status).send(errorResponse)
  }
}

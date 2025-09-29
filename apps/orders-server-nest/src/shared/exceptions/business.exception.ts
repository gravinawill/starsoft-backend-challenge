import { HttpException, HttpStatus } from '@nestjs/common'

export class BusinessException extends HttpException {
  constructor(message: string, status: HttpStatus = HttpStatus.BAD_REQUEST, details?: Record<string, unknown>) {
    super({ message, details }, status)
    this.name = this.constructor.name
  }
}

export class ValidationException extends BusinessException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST)
  }
}

export class AuthenticationException extends BusinessException {
  constructor(message = 'Authentication failed') {
    super(message, HttpStatus.UNAUTHORIZED)
  }
}

export class NotFoundException extends BusinessException {
  constructor(message = 'Resource not found') {
    super(message, HttpStatus.NOT_FOUND)
  }
}

export class InternalServerException extends BusinessException {
  constructor(message = 'Internal server error') {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR)
  }
}

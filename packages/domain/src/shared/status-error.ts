import { HTTP_STATUS_CODE } from '@niki/utils'

export enum STATUS_ERROR {
  NOT_FOUND = 'NOT_FOUND',
  NOT_EXISTS = 'NOT_EXISTS',
  INVALID = 'INVALID',
  REPOSITORY_ERROR = 'REPOSITORY_ERROR',
  PROVIDER_ERROR = 'PROVIDER_ERROR',
  CONFLICT = 'CONFLICT',
  UNAUTHORIZED = 'UNAUTHORIZED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS'
}

export function getStatusError(parameters: { error: unknown }): STATUS_ERROR {
  if (
    typeof parameters.error === 'object' &&
    parameters.error !== null &&
    'status' in parameters.error &&
    Object.values(STATUS_ERROR).includes((parameters.error as { status: STATUS_ERROR }).status)
  ) {
    return (parameters.error as { status: STATUS_ERROR }).status
  }
  return STATUS_ERROR.INTERNAL_ERROR
}

export function getHttpStatusCodeByStatusError(parameters: { status: STATUS_ERROR }): { statusCode: HTTP_STATUS_CODE } {
  switch (parameters.status) {
    case STATUS_ERROR.NOT_FOUND: {
      return { statusCode: HTTP_STATUS_CODE.NOT_FOUND }
    }
    case STATUS_ERROR.NOT_EXISTS: {
      return { statusCode: HTTP_STATUS_CODE.NOT_FOUND }
    }
    case STATUS_ERROR.INVALID: {
      return { statusCode: HTTP_STATUS_CODE.BAD_REQUEST }
    }
    case STATUS_ERROR.REPOSITORY_ERROR: {
      return { statusCode: HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR }
    }
    case STATUS_ERROR.PROVIDER_ERROR: {
      return { statusCode: HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR }
    }
    case STATUS_ERROR.INTERNAL_ERROR: {
      return { statusCode: HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR }
    }
    case STATUS_ERROR.CONFLICT: {
      return { statusCode: HTTP_STATUS_CODE.CONFLICT }
    }
    case STATUS_ERROR.UNAUTHORIZED: {
      return { statusCode: HTTP_STATUS_CODE.UNAUTHORIZED }
    }
    case STATUS_ERROR.TOO_MANY_REQUESTS: {
      return { statusCode: HTTP_STATUS_CODE.TOO_MANY_REQUESTS }
    }
    default: {
      return { statusCode: HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR }
    }
  }
}

export function extractErrorMessage(parameters: { error: unknown }): string {
  if (parameters.error instanceof Error) return parameters.error.message
  if (typeof parameters.error === 'string') return parameters.error
  if (parameters.error && typeof parameters.error === 'object' && 'errorMessage' in parameters.error) {
    const message = (parameters.error as { errorMessage: unknown }).errorMessage
    if (typeof message === 'string') return message
  }
  if (parameters.error && typeof parameters.error === 'object' && 'provider' in parameters.error) {
    const providerError = (parameters.error as { provider?: { error?: unknown } }).provider?.error
    if (providerError && typeof providerError === 'string') return providerError
  }
  return 'An unexpected error occurred'
}

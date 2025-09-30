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

export function getStatusError(parameters: { error: unknown }): { status: STATUS_ERROR } {
  if (
    typeof parameters.error === 'object' &&
    parameters.error !== null &&
    'status' in parameters.error &&
    Object.values(STATUS_ERROR).includes((parameters.error as { status: STATUS_ERROR }).status)
  ) {
    return { status: (parameters.error as { status: STATUS_ERROR }).status }
  }
  return { status: STATUS_ERROR.INTERNAL_ERROR }
}

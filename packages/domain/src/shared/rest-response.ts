import { HTTP_STATUS_CODE } from '@niki/utils'

import { getStatusError, STATUS_ERROR } from './status-error'
import { STATUS_SUCCESS } from './status-success'

export type RestSuccessResponse<DATA = unknown> = { message: string; data: DATA }

export type RestErrorResponse = { name: string; message: string }

export type RestSuccessResult<DATA = unknown> = {
  status: STATUS_SUCCESS
  statusCode: HTTP_STATUS_CODE
  success: RestSuccessResponse<DATA>
  error: null
}

export type RestErrorResult = {
  status: STATUS_ERROR
  statusCode: HTTP_STATUS_CODE
  success: null
  error: RestErrorResponse
}

export type RestResponse<DATA = unknown> = RestSuccessResult<DATA> | RestErrorResult

const STATUS_ERROR_TO_HTTP_CODE: Record<STATUS_ERROR, HTTP_STATUS_CODE> = {
  [STATUS_ERROR.NOT_FOUND]: HTTP_STATUS_CODE.NOT_FOUND,
  [STATUS_ERROR.NOT_EXISTS]: HTTP_STATUS_CODE.NOT_FOUND,
  [STATUS_ERROR.INVALID]: HTTP_STATUS_CODE.BAD_REQUEST,
  [STATUS_ERROR.REPOSITORY_ERROR]: HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
  [STATUS_ERROR.PROVIDER_ERROR]: HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
  [STATUS_ERROR.INTERNAL_ERROR]: HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
  [STATUS_ERROR.CONFLICT]: HTTP_STATUS_CODE.CONFLICT,
  [STATUS_ERROR.UNAUTHORIZED]: HTTP_STATUS_CODE.UNAUTHORIZED,
  [STATUS_ERROR.TOO_MANY_REQUESTS]: HTTP_STATUS_CODE.TOO_MANY_REQUESTS
}

const STATUS_SUCCESS_TO_HTTP_CODE: Record<STATUS_SUCCESS, HTTP_STATUS_CODE> = {
  [STATUS_SUCCESS.CREATED]: HTTP_STATUS_CODE.CREATED,
  [STATUS_SUCCESS.UPDATED]: HTTP_STATUS_CODE.OK,
  [STATUS_SUCCESS.DELETED]: HTTP_STATUS_CODE.OK,
  [STATUS_SUCCESS.DONE]: HTTP_STATUS_CODE.OK
}

export function getHttpStatusCodeByStatusError(parameters: { status: STATUS_ERROR }): { statusCode: HTTP_STATUS_CODE } {
  return { statusCode: STATUS_ERROR_TO_HTTP_CODE[parameters.status] }
}

export function getHttpStatusCodeByStatusSuccess(parameters: { status: STATUS_SUCCESS }): {
  statusCode: HTTP_STATUS_CODE
} {
  return { statusCode: STATUS_SUCCESS_TO_HTTP_CODE[parameters.status] }
}

type ExtractedError = { errorMessage: string; errorName: string }

function extractStringFromProperty(obj: object, property: string): string | null {
  if (property in obj) {
    const value = (obj as Record<string, unknown>)[property]
    return typeof value === 'string' ? value : null
  }
  return null
}

function extractProviderError(error: object): ExtractedError | null {
  if ('provider' in error) {
    const providerError = (error as { provider?: { error?: unknown } }).provider?.error
    if (typeof providerError === 'string') return { errorMessage: providerError, errorName: 'ProviderError' }
  }
  return null
}

export function extractErrorData(parameters: { error: unknown }): ExtractedError {
  const { error } = parameters
  const defaultError: ExtractedError = {
    errorMessage: 'An unexpected error occurred',
    errorName: 'InternalError'
  }

  if (error instanceof Error) {
    return { errorMessage: error.message || defaultError.errorMessage, errorName: error.name || 'Error' }
  }

  if (typeof error === 'string') return { errorMessage: error, errorName: 'Error' }

  if (error && typeof error === 'object') {
    const errorMessage = extractStringFromProperty(error, 'errorMessage')
    if (errorMessage) return { errorMessage, errorName: 'Error' }

    const message = extractStringFromProperty(error, 'message')
    if (message) return { errorMessage: message, errorName: 'Error' }

    const providerError = extractProviderError(error)
    if (providerError) return providerError
  }

  return defaultError
}

export function createSuccessResponse<DATA = unknown>(parameters: {
  data: DATA
  message: string
  status: STATUS_SUCCESS
}): RestSuccessResult<DATA> {
  return {
    status: parameters.status,
    statusCode: getHttpStatusCodeByStatusSuccess({ status: parameters.status }).statusCode,
    success: {
      data: parameters.data,
      message: parameters.message
    },
    error: null
  }
}

export function createErrorResponse(parameters: {
  error: { name: string; errorMessage: string; status?: STATUS_ERROR }
}): RestErrorResult {
  const { status } = getStatusError({ error: parameters.error })
  const { statusCode } = getHttpStatusCodeByStatusError({ status })
  const { errorMessage, errorName } = extractErrorData({ error: parameters.error })
  return {
    status,
    statusCode,
    error: { name: errorName, message: errorMessage },
    success: null
  }
}

type CreateRestResponseParameters =
  | { success: { data: unknown; message: string; status: STATUS_SUCCESS }; error?: null }
  | { error: { name: string; errorMessage: string; status?: STATUS_ERROR }; success?: null }

export function createRestResponse(parameters: CreateRestResponseParameters): RestResponse {
  if (parameters.success) {
    return createSuccessResponse({
      data: parameters.success.data,
      message: parameters.success.message,
      status: parameters.success.status
    })
  }
  return createErrorResponse({ error: parameters.error })
}

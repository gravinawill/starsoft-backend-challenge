import { type STATUS_ERROR } from './status-error'
import { type STATUS_SUCCESS } from './status-success'

export type RestResponse = {
  status: STATUS_ERROR | STATUS_SUCCESS
  success: {
    data: unknown
    message: string
    requestID: string
  } | null
  error: {
    name: string
    message: string
    requestID: string
  } | null
}

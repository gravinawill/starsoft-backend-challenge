import { type ProviderError } from '@niki/domain'
import { type Either } from '@niki/utils'

export type BaseEventContract = {
  id: string
  type: string
  timestamp: Date
  version: string
  aggregateID: string
}

export interface IBaseEvent {
  connect(): Promise<Either<ProviderError, null>>
  disconnect(): Promise<Either<ProviderError, null>>
}

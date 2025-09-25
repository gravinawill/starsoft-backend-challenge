import type { BaseEventContract } from '../event-contracts/base.event-contract'
import type { KafkaProducer } from '../producer'
import type {
  ISendLogErrorLoggerProvider,
  ISendLogInfoLoggerProvider,
  ISendLogWarnLoggerProvider,
  ProviderError
} from '@niki/domain'
import type { Either } from '@niki/utils'

import { failure, success } from '@niki/utils'

import { BaseEventHandler } from './base-event-handler'

export abstract class BaseProducer<TEventContract extends BaseEventContract> extends BaseEventHandler {
  constructor(
    protected readonly kafkaProducer: KafkaProducer,
    logger: ISendLogErrorLoggerProvider & ISendLogInfoLoggerProvider & ISendLogWarnLoggerProvider
  ) {
    super(logger)
  }

  protected async publishEvent(topic: string, event: TEventContract): Promise<Either<ProviderError, null>> {
    try {
      const connectionResult = await this.ensureConnection()
      if (connectionResult.isFailure()) return connectionResult
      await this.kafkaProducer.publishEvent(topic, event)
      return success(null)
    } catch (error: unknown) {
      return failure(this.createProviderError(error, 'publishEvent'))
    }
  }

  protected async publishEvents(topic: string, events: TEventContract[]): Promise<Either<ProviderError, null>> {
    try {
      const connectionResult = await this.ensureConnection()
      if (connectionResult.isFailure()) return connectionResult
      await this.kafkaProducer.publishEvents(topic, events)
      return success(null)
    } catch (error: unknown) {
      return failure(this.createProviderError(error, 'publishEvents'))
    }
  }

  private async ensureConnection(): Promise<Either<ProviderError, null>> {
    if (this.isConnected) return success(null)
    return this.connect()
  }

  protected async doConnect(): Promise<Either<ProviderError, null>> {
    try {
      await this.kafkaProducer.connect()
      return success(null)
    } catch (error: unknown) {
      return failure(this.createProviderError(error, 'doConnect'))
    }
  }

  protected async doDisconnect(): Promise<Either<ProviderError, null>> {
    try {
      await this.kafkaProducer.disconnect()
      return success(null)
    } catch (error: unknown) {
      return failure(this.createProviderError(error, 'doDisconnect'))
    }
  }
}

import { type ISendLogErrorLoggerProvider, type ISendLogInfoLoggerProvider, ProviderError } from '@niki/domain'
import { type Either, failure, success } from '@niki/utils'

import { type IBaseEvent } from '../event-contracts/base.event-contract'

export abstract class BaseEventHandler implements IBaseEvent {
  constructor(protected readonly logger: ISendLogErrorLoggerProvider & ISendLogInfoLoggerProvider) {}

  protected isConnected = false

  protected readonly retryConfig = {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 30_000,
    backoffMultiplier: 2
  } as const

  public async connect(): Promise<Either<ProviderError, null>> {
    if (this.isConnected) return success(null)
    return this.withRetry(() => this.doConnect(), 'connect')
  }

  public async disconnect(): Promise<Either<ProviderError, null>> {
    if (!this.isConnected) return success(null)
    const disconnectResult = await this.withRetry(() => this.doDisconnect(), 'disconnect')
    if (disconnectResult.isSuccess()) {
      this.isConnected = false
      await this.resetState()
    }
    return disconnectResult
  }

  public isReady(): boolean {
    return this.isConnected
  }

  protected abstract doConnect(): Promise<Either<ProviderError, null>>

  protected abstract doDisconnect(): Promise<Either<ProviderError, null>>

  protected abstract resetState(): Promise<void>

  protected async withRetry<T>(
    operation: () => Promise<Either<ProviderError, T>>,
    methodName: string
  ): Promise<Either<ProviderError, T>> {
    let lastError: ProviderError | undefined
    let delay = this.retryConfig.initialDelay
    for (let attempt = 1; attempt <= this.retryConfig.maxRetries; attempt++) {
      const result = await operation()
      if (result.isSuccess()) {
        if (methodName === 'connect') this.isConnected = true
        return result
      }
      lastError = result.value
      this.logger.sendLogError({
        message: `[${this.constructor.name}:${methodName}] Attempt ${attempt}/${this.retryConfig.maxRetries} failed:`,
        value: lastError
      })
      if (attempt < this.retryConfig.maxRetries) {
        this.logger.sendLogInfo({
          message: `[${this.constructor.name}:${methodName}] Retrying in ${delay}ms...`
        })
        await this.delay(delay)
        delay = Math.min(
          delay * this.retryConfig.backoffMultiplier,
          this.retryConfig.maxDelay
        ) as typeof this.retryConfig.initialDelay
      }
    }
    return failure(lastError!)
  }

  protected delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Factory method for creating ProviderError instances
   */
  protected createProviderError(error: unknown, methodName: string): ProviderError {
    return new ProviderError({
      error,
      provider: {
        name: 'message-broker',
        method: methodName,
        externalName: 'kafkajs'
      }
    })
  }
}

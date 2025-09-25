import {
  type ISendLogErrorLoggerProvider,
  type ISendLogInfoLoggerProvider,
  type ISendLogWarnLoggerProvider,
  type ProviderError
} from '@niki/domain'
import { type Either, failure, success } from '@niki/utils'

import { type KafkaConsumer } from '../consumer'

import { BaseEventHandler } from './base-event-handler'

interface ConsumerState {
  isConsuming: boolean
  subscriptions: Set<string>
  handlers: Map<string, Array<(payload: unknown) => Promise<void>>>
}

export abstract class BaseConsumer extends BaseEventHandler {
  protected state: ConsumerState = {
    isConsuming: false,
    subscriptions: new Set(),
    handlers: new Map()
  }

  constructor(
    protected readonly kafkaConsumer: KafkaConsumer,
    logger: ISendLogErrorLoggerProvider & ISendLogInfoLoggerProvider & ISendLogWarnLoggerProvider
  ) {
    super(logger)
  }

  protected async consumeEvent(
    eventType: string,
    topic: string,
    handler: (payload: unknown) => Promise<void>
  ): Promise<Either<ProviderError, { payload: unknown }>> {
    try {
      const connectionResult = await this.ensureConnection()
      if (connectionResult.isFailure()) {
        return failure(connectionResult.value)
      }

      const subscriptionResult = await this.ensureSubscription(topic)
      if (subscriptionResult.isFailure()) {
        return failure(subscriptionResult.value)
      }

      this.registerHandlerWithRetry(eventType, handler)

      const consumingResult = await this.ensureConsuming()
      if (consumingResult.isFailure()) {
        return failure(consumingResult.value)
      }

      return success({ payload: {} as unknown })
    } catch (error) {
      return failure(this.createProviderError(error, 'consumeEvent'))
    }
  }

  private async ensureConnection(): Promise<Either<ProviderError, null>> {
    if (this.isConnected) {
      return success(null)
    }
    return this.connect()
  }

  private async ensureSubscription(topic: string): Promise<Either<ProviderError, null>> {
    try {
      if (this.state.subscriptions.has(topic)) {
        return success(null)
      }

      await this.kafkaConsumer.subscribe([topic])
      this.state.subscriptions.add(topic)
      return success(null)
    } catch (error) {
      return failure(this.createProviderError(error, 'ensureSubscription'))
    }
  }

  private async ensureConsuming(): Promise<Either<ProviderError, null>> {
    try {
      if (this.state.isConsuming) {
        return success(null)
      }

      await this.kafkaConsumer.startConsuming()
      this.state.isConsuming = true
      return success(null)
    } catch (error) {
      return failure(this.createProviderError(error, 'ensureConsuming'))
    }
  }

  private registerHandlerWithRetry(eventType: string, handler: (payload: unknown) => Promise<void>): void {
    const wrappedHandler = async (message: unknown) => {
      const event = message as { payload: unknown }
      await this.executeWithRetry(() => handler(event.payload), `Handler for ${eventType}`, event.payload)
    }

    this.kafkaConsumer.registerHandler(eventType, wrappedHandler)

    if (!this.state.handlers.has(eventType)) {
      this.state.handlers.set(eventType, [])
    }
    this.state.handlers.get(eventType)?.push(handler)
  }

  private async executeWithRetry<T>(fn: () => Promise<T>, context: string, payload?: unknown): Promise<T> {
    let lastError: unknown
    let delay = this.retryConfig.initialDelay

    for (let attempt = 1; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error
        console.error(
          `[${context}] Attempt ${attempt}/${this.retryConfig.maxRetries} failed:`,
          error instanceof Error ? error.message : String(error)
        )

        if (attempt < this.retryConfig.maxRetries) {
          console.log(`[${context}] Retrying in ${delay}ms...`)
          await this.delay(delay)
          delay = Math.min(
            delay * this.retryConfig.backoffMultiplier,
            this.retryConfig.maxDelay
          ) as typeof this.retryConfig.initialDelay
        }
      }
    }

    console.error(`[${context}] All ${this.retryConfig.maxRetries} attempts failed. Payload:`, payload)
    throw lastError
  }

  protected async doConnect(): Promise<Either<ProviderError, null>> {
    try {
      await this.kafkaConsumer.connect()
      return success(null)
    } catch (error) {
      return failure(this.createProviderError(error, 'doConnect'))
    }
  }

  protected async doDisconnect(): Promise<Either<ProviderError, null>> {
    try {
      await this.kafkaConsumer.disconnect()
      return success(null)
    } catch (error) {
      return failure(this.createProviderError(error, 'doDisconnect'))
    }
  }

  protected override resetState(): Promise<void> {
    this.state.isConsuming = false
    this.state.subscriptions.clear()
    this.state.handlers.clear()
    return Promise.resolve()
  }
}

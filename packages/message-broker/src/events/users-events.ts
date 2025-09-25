import { ProviderError } from '@niki/domain'
import { type Either, failure, success } from '@niki/utils'
import { v7 as randomUUID_v7 } from 'uuid'

import { type KafkaConsumer } from '../consumer'
import {
  type IUsersConsumerEvents,
  type IUsersProducerEvents,
  type UserCreatedEventContract,
  type UserCreatedEventPayload,
  USERS_EVENTS_NAMES
} from '../event-contracts/users.event-contract'
import { type KafkaProducer } from '../producer'

export class UsersProducerEvents implements IUsersProducerEvents {
  private isConnected = false

  constructor(private readonly kafkaProducer: KafkaProducer) {}

  public async connect(): Promise<Either<ProviderError, null>> {
    try {
      if (!this.isConnected) {
        await this.kafkaProducer.connect()
        this.isConnected = true
      }
      return success(null)
    } catch (error) {
      const providerError = new ProviderError({
        error,
        provider: {
          name: 'message-broker',
          method: 'connect',
          externalName: 'kafkajs'
        }
      })
      return failure(providerError)
    }
  }

  public async disconnect(): Promise<Either<ProviderError, null>> {
    try {
      if (this.isConnected) {
        await this.kafkaProducer.disconnect()
        this.isConnected = false
      }
      return success(null)
    } catch (error) {
      const providerError = new ProviderError({
        error,
        provider: {
          name: 'message-broker',
          method: 'disconnect',
          externalName: 'kafkajs'
        }
      })
      return failure(providerError)
    }
  }

  public async publishUserCreatedEvent(parameters: {
    payload: UserCreatedEventPayload
  }): Promise<Either<ProviderError, null>> {
    try {
      if (!this.isConnected) {
        const connectResult = await this.connect()
        if (!connectResult.isSuccess()) return connectResult
      }

      await this.kafkaProducer.publishUserEvent(USERS_EVENTS_NAMES.USER_CREATED, {
        id: `user-created-${randomUUID_v7()}`,
        type: 'USER_CREATED',
        timestamp: new Date(),
        version: '1.0.0',
        aggregateID: parameters.payload.userID,
        payload: parameters.payload
      })

      return success(null)
    } catch (error) {
      const providerError = new ProviderError({
        error,
        provider: {
          name: 'message-broker',
          method: 'publishUserCreatedEvent',
          externalName: 'kafkajs'
        }
      })
      return failure(providerError)
    }
  }
}

interface ConsumerState {
  isConnected: boolean
  isConsuming: boolean
  subscriptions: Set<string>
  handlers: Map<string, Array<(payload: unknown) => Promise<void>>>
}

interface RetryConfig {
  maxRetries: number
  initialDelay: number
  maxDelay: number
  backoffMultiplier: number
}

export class UsersConsumerEvents implements IUsersConsumerEvents {
  private state: ConsumerState = {
    isConnected: false,
    isConsuming: false,
    subscriptions: new Set(),
    handlers: new Map()
  }

  private readonly retryConfig: RetryConfig = {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 30_000,
    backoffMultiplier: 2
  }

  constructor(private readonly kafkaConsumer: KafkaConsumer) {}

  public async connect(): Promise<Either<ProviderError, null>> {
    try {
      if (this.state.isConnected) {
        return success(null)
      }

      await this.kafkaConsumer.connect()
      this.state.isConnected = true
      return success(null)
    } catch (error) {
      return failure(
        new ProviderError({
          error,
          provider: {
            name: 'message-broker',
            method: 'connect',
            externalName: 'kafkajs'
          }
        })
      )
    }
  }

  public async disconnect(): Promise<Either<ProviderError, null>> {
    try {
      if (!this.state.isConnected) {
        return success(null)
      }

      await this.kafkaConsumer.disconnect()
      this.state.isConnected = false
      this.state.isConsuming = false
      this.state.subscriptions.clear()
      this.state.handlers.clear()
      return success(null)
    } catch (error) {
      return failure(
        new ProviderError({
          error,
          provider: {
            name: 'message-broker',
            method: 'disconnect',
            externalName: 'kafkajs'
          }
        })
      )
    }
  }

  public async consumeUserCreatedEvent(parameters: {
    onUserCreated: (payload: UserCreatedEventPayload) => Promise<void>
  }): Promise<Either<ProviderError, { payload: UserCreatedEventPayload }>> {
    try {
      const connectionResult = await this.ensureConnection()
      if (connectionResult.isFailure()) return failure(connectionResult.value)
      const subscriptionResult = await this.ensureSubscription(USERS_EVENTS_NAMES.USER_CREATED)
      if (subscriptionResult.isFailure()) return failure(subscriptionResult.value)
      this.registerHandlerWithRetry('USER_CREATED', parameters.onUserCreated)
      const consumingResult = await this.ensureConsuming()
      if (consumingResult.isFailure()) return failure(consumingResult.value)
      return success({ payload: {} as UserCreatedEventPayload })
    } catch (error) {
      return failure(
        new ProviderError({
          error,
          provider: {
            name: 'message-broker',
            method: 'consumeUserCreatedEvent',
            externalName: 'kafkajs'
          }
        })
      )
    }
  }

  private async ensureConnection(): Promise<Either<ProviderError, null>> {
    if (this.state.isConnected) return success(null)
    return this.withRetry(() => this.connect(), 'ensureConnection')
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
      return failure(
        new ProviderError({
          error,
          provider: {
            name: 'message-broker',
            method: 'ensureSubscription',
            externalName: 'kafkajs'
          }
        })
      )
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
      return failure(
        new ProviderError({
          error,
          provider: {
            name: 'message-broker',
            method: 'ensureConsuming',
            externalName: 'kafkajs'
          }
        })
      )
    }
  }

  private registerHandlerWithRetry(
    eventType: string,
    handler: (payload: UserCreatedEventPayload) => Promise<void>
  ): void {
    const wrappedHandler = async (message: unknown) => {
      const event = message as UserCreatedEventContract
      await this.executeWithRetry(() => handler(event.payload), `Handler for ${eventType}`, event.payload)
    }
    this.kafkaConsumer.registerHandler(eventType, wrappedHandler)
    if (!this.state.handlers.has(eventType)) this.state.handlers.set(eventType, [])
    this.state.handlers.get(eventType)?.push(handler as unknown as (payload: unknown) => Promise<void>)
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
          delay = Math.min(delay * this.retryConfig.backoffMultiplier, this.retryConfig.maxDelay)
        }
      }
    }

    console.error(`[${context}] All ${this.retryConfig.maxRetries} attempts failed. Payload:`, payload)
    throw lastError
  }

  private async withRetry<T>(
    operation: () => Promise<Either<ProviderError, T>>,
    methodName: string
  ): Promise<Either<ProviderError, T>> {
    let lastError: ProviderError | undefined
    let delay = this.retryConfig.initialDelay

    for (let attempt = 1; attempt <= this.retryConfig.maxRetries; attempt++) {
      const result = await operation()

      if (result.isSuccess()) {
        return result
      }

      lastError = result.value
      console.error(`[${methodName}] Attempt ${attempt}/${this.retryConfig.maxRetries} failed:`, lastError)

      if (attempt < this.retryConfig.maxRetries) {
        await this.delay(delay)
        delay = Math.min(delay * this.retryConfig.backoffMultiplier, this.retryConfig.maxDelay)
      }
    }

    return failure(lastError!)
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

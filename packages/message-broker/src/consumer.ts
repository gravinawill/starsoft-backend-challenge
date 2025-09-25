import type { ISendLogErrorLoggerProvider, ISendLogInfoLoggerProvider, ISendLogWarnLoggerProvider } from '@niki/domain'

import { type Consumer, type EachMessagePayload, Kafka, type SASLOptions } from 'kafkajs'

import { type ConsumerConfig } from './types'

export type MessageHandler<T = unknown> = (message: T, metadata: MessageMetadata) => Promise<void>

export interface MessageMetadata {
  topic: string
  partition: number
  offset: string
  key?: string
  headers?: Record<string, string>
  timestamp: string
}

export class KafkaConsumer {
  private kafka: Kafka
  private consumer: Consumer
  private isConnected = false
  private messageHandlers = new Map<string, MessageHandler>()

  constructor(
    private config: ConsumerConfig,
    private logger: ISendLogErrorLoggerProvider & ISendLogInfoLoggerProvider & ISendLogWarnLoggerProvider
  ) {
    this.kafka = new Kafka({
      clientId: this.config.clientID,
      brokers: this.config.brokers,
      ssl: this.config.ssl,
      sasl: this.config.sasl as SASLOptions,
      retry: this.config.retry
    })

    this.consumer = this.kafka.consumer({
      groupId: this.config.groupId,
      sessionTimeout: this.config.sessionTimeout ?? 30_000,
      rebalanceTimeout: this.config.rebalanceTimeout ?? 60_000,
      heartbeatInterval: this.config.heartbeatInterval ?? 3000,
      maxBytesPerPartition: this.config.maxBytesPerPartition ?? 1_048_576,
      minBytes: this.config.minBytes ?? 1,
      maxBytes: this.config.maxBytes ?? 10_485_760,
      maxWaitTimeInMs: this.config.maxWaitTimeInMs ?? 5000,
      retry: {
        initialRetryTime: 300,
        retries: 8
      }
    })
  }

  async connect(): Promise<void> {
    try {
      await this.consumer.connect()
      this.isConnected = true
      this.logger.sendLogInfo({
        message: '🔗 Kafka consumer connected successfully',
        data: { groupId: this.config.groupId }
      })
    } catch (error) {
      this.logger.sendLogError({ message: '❌ Failed to connect Kafka consumer:', value: error })
      throw error
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.consumer.disconnect()
      this.isConnected = false
      this.logger.sendLogInfo({ message: '🔌 Kafka consumer disconnected successfully' })
    } catch (error) {
      this.logger.sendLogError({ message: '❌ Error disconnecting Kafka consumer:', value: error })
      throw error
    }
  }

  async subscribe(topics: string[]): Promise<void> {
    if (!this.isConnected) {
      throw new Error('❌ Consumer is not connected. Call connect() first.')
    }

    try {
      await this.consumer.subscribe({
        topics,
        fromBeginning: false
      })
      this.logger.sendLogInfo({ message: '📝 Subscribed to topics', data: { topics } })
    } catch (error) {
      this.logger.sendLogError({ message: '❌ Error subscribing to topics:', value: error })
      throw error
    }
  }

  registerHandler(eventType: string, handler: MessageHandler): void {
    this.messageHandlers.set(eventType, handler)
    this.logger.sendLogInfo({ message: '📋 Handler registered', data: { eventType } })
  }

  async startConsuming(): Promise<void> {
    if (!this.isConnected) {
      throw new Error('❌ Consumer is not connected. Call connect() first.')
    }

    await this.consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        await this.handleMessage(payload)
      }
    })

    this.logger.sendLogInfo({ message: '🚀 Consumer started successfully' })
  }

  private async handleMessage(payload: EachMessagePayload): Promise<void> {
    const { topic, partition, message } = payload

    try {
      const messageValue = message.value?.toString()
      if (!messageValue) {
        this.logger.sendLogWarn({
          message: '⚠️ Received empty message',
          data: { topic, partition, offset: message.offset }
        })
        return
      }

      const parsedMessage = JSON.parse(messageValue) as unknown as { type: string; id: string }
      const headers = this.parseHeaders(message.headers ?? {})

      const metadata: MessageMetadata = {
        topic,
        partition,
        offset: message.offset,
        key: message.key?.toString(),
        headers,
        timestamp: message.timestamp
      }

      const handler = this.messageHandlers.get(parsedMessage.type)
      if (handler) {
        await handler(parsedMessage, metadata)
        this.logger.sendLogInfo({
          message: '✅ Message processed successfully',
          data: {
            topic,
            eventType: parsedMessage.type,
            eventID: parsedMessage.id,
            offset: message.offset
          }
        })
      } else {
        this.logger.sendLogWarn({
          message: '⚠️ No handler found for event type',
          data: {
            eventType: parsedMessage.type,
            topic,
            offset: message.offset
          }
        })
      }
    } catch (error) {
      this.logger.sendLogError({
        message: '❌ Error processing message:',
        value: {
          topic,
          partition,
          offset: message.offset,
          error: error instanceof Error ? error.message : String(error)
        }
      })
      throw error
    }
  }

  private parseHeaders(headers: Record<string, unknown>): Record<string, string> {
    const parsedHeaders: Record<string, string> = {}
    for (const [key, value] of Object.entries(headers)) {
      parsedHeaders[key] = Buffer.isBuffer(value) ? value.toString() : String(value)
    }
    return parsedHeaders
  }

  isReady(): boolean {
    return this.isConnected
  }
}

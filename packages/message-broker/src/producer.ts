import { type ISendLogErrorLoggerProvider, type ISendLogInfoLoggerProvider } from '@niki/domain'
import { Kafka, type Producer, type ProducerRecord, type RecordMetadata, type SASLOptions } from 'kafkajs'

import { type BaseEventContract } from './event-contracts/base.event-contract'
import { type ProducerConfig } from './types'

export class KafkaProducer {
  private kafka: Kafka
  private producer: Producer
  private isConnected = false

  constructor(
    private config: ProducerConfig,
    private logger: ISendLogErrorLoggerProvider & ISendLogInfoLoggerProvider
  ) {
    this.kafka = new Kafka({
      clientId: this.config.clientID,
      brokers: this.config.brokers,
      ssl: this.config.ssl,
      sasl: this.config.sasl as SASLOptions,
      retry: this.config.retry
    })

    this.producer = this.kafka.producer({
      maxInFlightRequests: 1,
      idempotent: true,
      transactionTimeout: 30_000,
      retry: {
        initialRetryTime: 300,
        retries: this.config.retries ?? 5
      }
    })
  }

  async connect(): Promise<void> {
    try {
      await this.producer.connect()
      this.isConnected = true
      this.logger.sendLogInfo({ message: '🔗 Kafka producer connected successfully' })
    } catch (error) {
      this.logger.sendLogError({ message: '❌ Failed to connect Kafka producer:', value: error })
      throw error
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.producer.disconnect()
      this.isConnected = false
      this.logger.sendLogInfo({ message: '🔌 Kafka producer disconnected successfully' })
    } catch (error) {
      this.logger.sendLogError({ message: '❌ Error disconnecting Kafka producer:', value: error })
      throw error
    }
  }

  async publishEvent(topic: string, event: BaseEventContract, partition?: number): Promise<RecordMetadata[]> {
    if (!this.isConnected) {
      throw new Error('❌ Producer is not connected. Call connect() first.')
    }

    try {
      const message: ProducerRecord = {
        topic,
        messages: [
          {
            partition,
            key: event.aggregateID,
            value: JSON.stringify(event),
            headers: {
              eventType: event.type,
              eventId: event.id,
              aggregateId: event.aggregateID,
              timestamp: event.timestamp.toISOString()
            }
          }
        ]
      }

      const metadata = await this.producer.send(message)

      this.logger.sendLogInfo({
        message: '✅ Event published successfully',
        data: {
          topic,
          eventType: event.type,
          eventId: event.id,
          aggregateId: event.aggregateID,
          partition: metadata[0]?.partition,
          offset: metadata[0]?.offset
        }
      })

      return metadata
    } catch (error) {
      this.logger.sendLogError({
        message: '❌ Error publishing event:',
        value: {
          topic,
          eventType: event.type,
          eventId: event.id,
          error: error instanceof Error ? error.message : String(error)
        }
      })
      throw error
    }
  }

  async publishEvents(topic: string, events: BaseEventContract[]): Promise<RecordMetadata[]> {
    if (!this.isConnected) {
      throw new Error('❌ Producer is not connected. Call connect() first.')
    }

    try {
      const messages = events.map((event) => ({
        key: event.aggregateID,
        value: JSON.stringify(event),
        headers: {
          eventType: event.type,
          eventId: event.id,
          aggregateId: event.aggregateID,
          timestamp: event.timestamp.toISOString()
        }
      }))

      const metadata = await this.producer.send({
        topic,
        messages
      })

      this.logger.sendLogInfo({
        message: `✅ ${events.length} events published successfully`,
        data: {
          topic,
          eventTypes: events.map((e) => e.type)
        }
      })

      return metadata
    } catch (error) {
      this.logger.sendLogError({
        message: '❌ Error publishing batch events:',
        value: error
      })
      throw error
    }
  }

  isReady(): boolean {
    return this.isConnected
  }
}

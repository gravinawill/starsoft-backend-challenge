import {
  type ISendLogErrorLoggerProvider,
  type ISendLogInfoLoggerProvider,
  type ISendLogWarnLoggerProvider
} from '@niki/domain'
import { makeLoggerProvider } from '@niki/logger'

import { KafkaConsumer } from './consumer'
import { KafkaProducer } from './producer'
import { type ConsumerConfig, type ProducerConfig } from './types'

export type HealthCheckStatus = 'healthy' | 'unhealthy' | 'degraded'
export type HealthCheckProducerStatus = 'connected' | 'disconnected' | 'error'
export type HealthCheckConsumerStatus = 'connected' | 'disconnected' | 'error'

export type HealthCheckResult = {
  status: HealthCheckStatus
  timestamp: string
  details: {
    producer?: {
      status: HealthCheckProducerStatus
      error?: string
    }
    consumer?: {
      status: HealthCheckConsumerStatus
      error?: string
    }
  }
  responseTimeMs: number
}

export type HealthCheckConfig = {
  producer?: ProducerConfig
  consumer?: ConsumerConfig
  timeoutMs?: number
}

export class MessageBrokerHealthCheck {
  static getInstance(params: {
    environments: { CLIENT_ID: string; BROKERS: string[]; GROUP_ID?: string }
    timeoutMs?: number
  }): MessageBrokerHealthCheck {
    return new MessageBrokerHealthCheck(makeLoggerProvider(), params.timeoutMs)
  }

  constructor(
    private readonly logger: ISendLogErrorLoggerProvider & ISendLogInfoLoggerProvider & ISendLogWarnLoggerProvider,
    private readonly timeoutMs = 5000
  ) {}

  async checkProducerHealthOnly(config: { producer: ProducerConfig }): Promise<HealthCheckResult> {
    return this.checkHealth({ producer: config.producer })
  }

  async checkConsumerHealthOnly(config: { consumer: ConsumerConfig }): Promise<HealthCheckResult> {
    return this.checkHealth({ consumer: config.consumer })
  }

  async checkFullHealth(config: { producer: ProducerConfig; consumer: ConsumerConfig }): Promise<HealthCheckResult> {
    return this.checkHealth({ producer: config.producer, consumer: config.consumer })
  }

  async checkHealth(config: HealthCheckConfig): Promise<HealthCheckResult> {
    const startTime = Date.now()
    const result: HealthCheckResult = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      details: {},
      responseTimeMs: 0
    }

    try {
      // Check producer health if config provided
      if (config.producer) {
        result.details.producer = await this.checkProducerHealth(config.producer)
      }

      // Check consumer health if config provided
      if (config.consumer) {
        result.details.consumer = await this.checkConsumerHealth(config.consumer)
      }

      // Determine overall health status
      result.status = this.determineOverallStatus(result.details)
      result.responseTimeMs = Date.now() - startTime

      this.logger.sendLogInfo({
        message: '🏥 Message broker health check completed',
        data: {
          status: result.status,
          responseTimeMs: result.responseTimeMs
        }
      })

      return result
    } catch (error) {
      result.status = 'unhealthy'
      result.responseTimeMs = Date.now() - startTime

      this.logger.sendLogError({
        message: '❌ Message broker health check failed',
        value: error
      })

      return result
    }
  }

  private async checkProducerHealth(config: ProducerConfig): Promise<{
    status: HealthCheckProducerStatus
    error?: string
  }> {
    let producer: KafkaProducer | undefined

    try {
      producer = new KafkaProducer(config, this.logger)

      await Promise.race([producer.connect(), this.createTimeout('Producer connection timeout')])

      const isReady = producer.isReady()

      return {
        status: isReady ? 'connected' : 'disconnected'
      }
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : String(error)
      }
    } finally {
      // Clean up connection
      if (producer) {
        try {
          await producer.disconnect()
        } catch (disconnectError) {
          this.logger.sendLogWarn({
            message: '⚠️ Failed to disconnect producer during health check',
            data: disconnectError
          })
        }
      }
    }
  }

  private async checkConsumerHealth(config: ConsumerConfig): Promise<{
    status: HealthCheckConsumerStatus
    error?: string
  }> {
    let consumer: KafkaConsumer | undefined

    try {
      consumer = new KafkaConsumer(config, this.logger)

      await Promise.race([consumer.connect(), this.createTimeout('Consumer connection timeout')])

      const isReady = consumer.isReady()

      return {
        status: isReady ? 'connected' : 'disconnected'
      }
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : String(error)
      }
    } finally {
      // Clean up connection
      if (consumer) {
        try {
          await consumer.disconnect()
        } catch (disconnectError) {
          this.logger.sendLogWarn({
            message: '⚠️ Failed to disconnect consumer during health check',
            data: disconnectError
          })
        }
      }
    }
  }

  private determineOverallStatus(details: HealthCheckResult['details']): 'healthy' | 'unhealthy' | 'degraded' {
    const statuses = [details.producer?.status, details.consumer?.status].filter(Boolean)

    if (statuses.length === 0) {
      return 'unhealthy'
    }

    const hasError = statuses.includes('error')
    const hasDisconnected = statuses.includes('disconnected')
    const allConnected = statuses.every((status) => status === 'connected')

    if (hasError) {
      return 'unhealthy'
    }

    if (allConnected) {
      return 'healthy'
    }

    if (hasDisconnected) {
      return 'degraded'
    }

    return 'degraded'
  }

  private createTimeout(message: string): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(message))
      }, this.timeoutMs)
    })
  }
}

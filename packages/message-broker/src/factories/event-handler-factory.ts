import {
  type ISendLogErrorLoggerProvider,
  type ISendLogInfoLoggerProvider,
  type ISendLogWarnLoggerProvider
} from '@niki/domain'
import { makeLoggerProvider } from '@niki/logger'

import { KafkaConsumer } from '../consumer'
import { type IUsersConsumerEvents } from '../event-contracts/users/consumer'
import { type IUsersProducerEvents } from '../event-contracts/users/producer'
import { UsersConsumerEvents, UsersProducerEvents } from '../events/users-events'
import { KafkaProducer } from '../producer'
import { type ConsumerConfig, type ProducerConfig } from '../types'

export interface EventHandlerConfig {
  clientId: string
  brokers: string[]
}

export interface ConsumerEventHandlerConfig extends EventHandlerConfig {
  groupId: string
  sessionTimeout?: number
  rebalanceTimeout?: number
  heartbeatInterval?: number
}

export class EventHandlerFactory {
  private static instance: EventHandlerFactory | undefined
  constructor(
    private readonly logger: ISendLogErrorLoggerProvider & ISendLogInfoLoggerProvider & ISendLogWarnLoggerProvider
  ) {}

  public static getInstance(): EventHandlerFactory {
    EventHandlerFactory.instance ??= new EventHandlerFactory(makeLoggerProvider())
    return EventHandlerFactory.instance
  }

  public createUsersProducer(config: EventHandlerConfig): IUsersProducerEvents {
    const producerConfig: ProducerConfig = {
      clientID: config.clientId,
      brokers: config.brokers
    }

    const kafkaProducer = new KafkaProducer(producerConfig, this.logger)
    return new UsersProducerEvents(kafkaProducer, this.logger)
  }

  public createUsersConsumer(config: ConsumerEventHandlerConfig): IUsersConsumerEvents {
    const consumerConfig: ConsumerConfig = {
      clientID: config.clientId,
      brokers: config.brokers,
      groupId: config.groupId,
      sessionTimeout: config.sessionTimeout,
      rebalanceTimeout: config.rebalanceTimeout,
      heartbeatInterval: config.heartbeatInterval
    }

    return new UsersConsumerEvents(new KafkaConsumer(consumerConfig, this.logger), this.logger)
  }

  public createGenericProducer(config: EventHandlerConfig): KafkaProducer {
    const producerConfig: ProducerConfig = {
      clientID: config.clientId,
      brokers: config.brokers
    }

    return new KafkaProducer(producerConfig, this.logger)
  }

  public createGenericConsumer(config: ConsumerEventHandlerConfig): KafkaConsumer {
    const consumerConfig: ConsumerConfig = {
      clientID: config.clientId,
      brokers: config.brokers,
      groupId: config.groupId,
      sessionTimeout: config.sessionTimeout,
      rebalanceTimeout: config.rebalanceTimeout,
      heartbeatInterval: config.heartbeatInterval
    }
    return new KafkaConsumer(consumerConfig, this.logger)
  }

  public static configBuilder(): EventHandlerConfigBuilder {
    return new EventHandlerConfigBuilder()
  }
}

export class EventHandlerConfigBuilder {
  private config: Partial<EventHandlerConfig> = {}
  private consumerConfig: Partial<ConsumerEventHandlerConfig> = {}

  public setClientId(clientId: string): this {
    this.config.clientId = clientId
    return this
  }

  public setBrokers(brokers: string[]): this {
    this.config.brokers = brokers
    return this
  }

  public setGroupId(groupId: string): this {
    this.consumerConfig.groupId = groupId
    return this
  }

  public setSessionTimeout(timeout: number): this {
    this.consumerConfig.sessionTimeout = timeout
    return this
  }

  public setRebalanceTimeout(timeout: number): this {
    this.consumerConfig.rebalanceTimeout = timeout
    return this
  }

  public setHeartbeatInterval(interval: number): this {
    this.consumerConfig.heartbeatInterval = interval
    return this
  }

  public buildProducerConfig(): EventHandlerConfig {
    this.validateProducerConfig()
    return { ...this.config } as EventHandlerConfig
  }

  public buildConsumerConfig(): ConsumerEventHandlerConfig {
    this.validateConsumerConfig()
    return { ...this.config, ...this.consumerConfig } as ConsumerEventHandlerConfig
  }

  private validateProducerConfig(): void {
    if (!this.config.clientId || !this.config.brokers) {
      throw new Error('ClientId and brokers are required for producer configuration')
    }
  }

  private validateConsumerConfig(): void {
    this.validateProducerConfig()
    if (!this.consumerConfig.groupId) {
      throw new Error('GroupId is required for consumer configuration')
    }
  }
}

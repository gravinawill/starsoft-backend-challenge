import type { ClientID, GroupID } from '.'

import { type ILoggerProvider } from '@niki/domain'
import { createEventContract, type EventContractType, selectEventContractType } from '@niki/domain/src/contracts/events'
import { type Consumer, Kafka, logLevel, type Producer } from 'kafkajs'
import { type z } from 'zod'

import { parseKafkaMessage } from './parse-kafka-message'

export namespace StartConsumerMessageBrokerDTO {
  export type Parameters = Readonly<{ groupID: GroupID }>
  export type Result = Promise<Readonly<Consumer>>
}

export type HandlerMessageBroker<Payload = unknown> = (parameters: {
  eventContractType: EventContractType
  payload: Payload
}) => Promise<void>

export namespace ProcessMessageMessageBrokerDTO {
  export type Parameters = Readonly<{
    groupID: GroupID
    functions: Array<{
      eventContractType: EventContractType
      handler: HandlerMessageBroker
      schema: z.ZodType
    }>
  }>
  export type Result = Promise<void>
}

export namespace SendMessageMessageBrokerDTO {
  export type Parameters<Payload> = Readonly<{ eventContractType: EventContractType; payload: Payload }>
  export type Result = Promise<void>
}

export interface IConsumerMessageBrokerProvider {
  processMessages(parameters: ProcessMessageMessageBrokerDTO.Parameters): ProcessMessageMessageBrokerDTO.Result
  sendMessage<Payload>(parameters: SendMessageMessageBrokerDTO.Parameters<Payload>): SendMessageMessageBrokerDTO.Result
}

export class KafkaMessageBrokerProvider implements IConsumerMessageBrokerProvider {
  private kafka: Kafka | undefined = undefined
  private static instance: KafkaMessageBrokerProvider | undefined = undefined

  private constructor(
    private readonly config: { brokers: string[]; clientID: ClientID },
    private readonly logger: ILoggerProvider
  ) {}

  public static getInstance(parameters: {
    config: { brokers: string[]; clientID: ClientID }
    logger: ILoggerProvider
  }): KafkaMessageBrokerProvider {
    KafkaMessageBrokerProvider.instance ??= new KafkaMessageBrokerProvider(parameters.config, parameters.logger)
    return KafkaMessageBrokerProvider.instance
  }

  private getKafkaInstance(): Kafka {
    this.kafka ??= new Kafka({
      clientId: this.config.clientID,
      brokers: this.config.brokers,
      logLevel: logLevel.WARN
    })
    return this.kafka
  }

  public async processMessages(
    parameters: ProcessMessageMessageBrokerDTO.Parameters
  ): ProcessMessageMessageBrokerDTO.Result {
    try {
      const consumer = await this.startConsumer({ groupID: parameters.groupID })
      await consumer.subscribe({
        topics: parameters.functions.map((value) => value.eventContractType),
        fromBeginning: true
      })
      await consumer.run({
        eachMessage: async ({ topic, message }): Promise<void> => {
          const contractTypeResult = selectEventContractType({ eventContractType: topic })
          if (contractTypeResult.isFailure()) {
            this.logger.sendLogError({ message: 'Unknown event contract type', value: { topic } })
            return
          }
          const result = parameters.functions.find(
            (value) => value.eventContractType === contractTypeResult.value.eventContractType
          )
          if (result === undefined) {
            this.logger.sendLogError({ message: '❌ Handler or schema not found', value: { topic } })
            return
          }
          const parsed = parseKafkaMessage({ message, schema: result.schema })
          if (parsed.isFailure()) {
            this.logger.sendLogError({ message: '❌ Error parsing message', value: { error: parsed.value } })
            return
          }
          await result.handler({
            eventContractType: contractTypeResult.value.eventContractType,
            payload: parsed.value
          })
          this.logger.sendLogInfo({ message: '✅ Message processed successfully' })
        }
      })
    } catch (error) {
      this.logger.sendLogError({ message: '❌ Failed to process messages', value: { error: error } })
    }
  }

  private async startConsumer(
    parameters: StartConsumerMessageBrokerDTO.Parameters
  ): StartConsumerMessageBrokerDTO.Result {
    const consumer = this.getKafkaInstance().consumer({
      groupId: parameters.groupID,
      sessionTimeout: 30_000,
      heartbeatInterval: 3000,
      maxWaitTimeInMs: 5000,
      retry: { initialRetryTime: 100, retries: 8 }
    })
    await this.connectWithRetry({ instance: consumer })
    return consumer
  }

  private async startProducer(): Promise<Producer> {
    const producer = this.getKafkaInstance().producer({
      maxInFlightRequests: 1,
      idempotent: true,
      retry: { initialRetryTime: 100, retries: 8 }
    })
    await this.connectWithRetry({ instance: producer })
    return producer
  }

  public async sendMessage<Payload>(
    parameters: SendMessageMessageBrokerDTO.Parameters<Payload>
  ): SendMessageMessageBrokerDTO.Result {
    try {
      const producer = await this.startProducer()
      const event = createEventContract<Payload>({
        eventContractType: parameters.eventContractType,
        payload: parameters.payload
      })
      await producer.send({
        topic: parameters.eventContractType,
        messages: [{ value: JSON.stringify(event.payload), key: event.id, timestamp: event.timestamp }]
      })
      this.logger.sendLogInfo({
        message: '📤 Message sent successfully'
      })
      await producer.disconnect()
    } catch (error) {
      this.logger.sendLogError({ message: '❌ Failed to send message', value: { error } })
    }
  }

  private async connectWithRetry(parameters: { instance: Consumer | Producer }): Promise<void> {
    const maxRetries = 5
    let retryCount = 0
    let isConnected = false

    while (!isConnected && retryCount < maxRetries) {
      try {
        await parameters.instance.connect()
        isConnected = true
        this.logger.sendLogInfo({ message: '✅ Successfully connected to Kafka', data: { attempt: retryCount + 1 } })
      } catch (error) {
        retryCount++
        this.logger.sendLogError({
          message: `❌ Failed to connect to Kafka (attempt ${retryCount}/${maxRetries})`,
          value: { error }
        })

        if (retryCount >= maxRetries) {
          throw new Error(`Failed to connect to Kafka after ${maxRetries} attempts`)
        }

        // Backoff exponencial: 1s, 2s, 4s, 8s, 16s
        const delayMs = Math.pow(2, retryCount) * 1000
        await new Promise((resolve) => setTimeout(resolve, delayMs))
      }
    }
  }
}

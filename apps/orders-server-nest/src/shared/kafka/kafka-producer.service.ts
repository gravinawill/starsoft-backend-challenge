import { Injectable, OnApplicationShutdown, OnModuleInit } from '@nestjs/common'
import { Kafka, Producer } from 'kafkajs'

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnApplicationShutdown {
  private readonly kafka = new Kafka({
    brokers: [process.env.MESSAGE_BROKER_PROVIDER_BROKER_URL ?? 'localhost:9092']
  })

  private readonly producer: Producer = this.kafka.producer()

  async onModuleInit() {
    await this.producer.connect()
  }

  async produce(topic: string, messages: Array<{ key?: string; value: string; headers?: Record<string, string> }>) {
    await this.producer.send({
      topic,
      messages
    })
  }

  async onApplicationShutdown() {
    await this.producer.disconnect()
  }
}

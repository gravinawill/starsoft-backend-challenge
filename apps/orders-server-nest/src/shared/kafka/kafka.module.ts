import { Module } from '@nestjs/common'

import { KafkaConsumerService } from './kafka-consumer.service'
import { KafkaProducerService } from './kafka-producer.service'

@Module({
  providers: [KafkaConsumerService, KafkaProducerService],
  exports: [KafkaConsumerService, KafkaProducerService]
})
export class KafkaModule {}

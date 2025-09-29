import { MessagePattern } from '@nestjs/microservices'

import { type KafkaTopic } from './constants'

export const KafkaMessagePattern = (topic: KafkaTopic) => MessagePattern(topic)

export const KafkaEventHandler = (topic: KafkaTopic) => {
  return function (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value as (...args: unknown[]) => unknown
    descriptor.value = async function (...args: unknown[]) {
      console.log(`[KafkaEventHandler] Handling event: ${topic}`)
      try {
        const result = await originalMethod.apply(this, args)
        console.log(`[KafkaEventHandler] Successfully handled event: ${topic}`)
        return result as unknown
      } catch (error) {
        console.error(`[KafkaEventHandler] Error handling event: ${topic}`, error)
        throw error
      }
    }
    MessagePattern(topic)(target as object, propertyKey, descriptor)
  }
}

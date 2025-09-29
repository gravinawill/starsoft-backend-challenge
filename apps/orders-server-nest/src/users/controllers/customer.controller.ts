import { Controller } from '@nestjs/common'
import { Payload } from '@nestjs/microservices'
import { KAFKA_TOPICS } from '@shared/kafka/constants'
import { KafkaMessagePattern } from '@shared/kafka/decorators'
import { KafkaConsumerService } from '@shared/kafka/kafka-consumer.service'
import { CustomerService } from '@users/services/create-customer.service'
import { z } from 'zod'

@Controller()
export class CustomerController {
  constructor(
    private readonly kafkaConsumerService: KafkaConsumerService,
    private readonly customerService: CustomerService
  ) {}

  @KafkaMessagePattern(KAFKA_TOPICS.USER_CREATED)
  public async handleCustomerCreated(@Payload() message: unknown) {
    console.log('Customer created event received:', message)
    const zodSchema = z.object({
      name: z.string(),
      userID: z.string(),
      createdAt: z.preprocess((val) => new Date(val as string), z.date()),
      updatedAt: z.preprocess((val) => new Date(val as string), z.date())
    })
    const parsedMessage = await zodSchema.safeParseAsync(message)
    if (!parsedMessage.success) {
      throw new Error('Invalid message: ' + parsedMessage.error.message)
    }
    const resultCreateCustomer = await this.customerService.createCustomer({
      createdAt: parsedMessage.data.createdAt,
      updatedAt: parsedMessage.data.updatedAt,
      name: parsedMessage.data.name,
      id: parsedMessage.data.userID
    })
    if (resultCreateCustomer.isFailure()) {
      throw new Error('Error creating customer, message error: ' + resultCreateCustomer.value.message)
    }
  }

  /*
   * @KafkaMessagePattern(KAFKA_TOPICS.USER_UPDATED)
   * handleCustomerUpdated(@Payload() message: unknown) {
   *   console.log('Customer updated event received:', message)
   * }
   */

  /*
   * @KafkaMessagePattern(KAFKA_TOPICS.USER_DELETED)
   * handleCustomerDeleted(@Payload() message: unknown) {
   *   console.log('Customer deleted event received:', message)
   * }
   */
}

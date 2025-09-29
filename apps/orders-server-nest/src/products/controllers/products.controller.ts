import { Controller } from '@nestjs/common'
import { Payload } from '@nestjs/microservices'
import { KAFKA_TOPICS } from '@shared/kafka/constants'
import { KafkaMessagePattern } from '@shared/kafka/decorators'
import { KafkaConsumerService } from '@shared/kafka/kafka-consumer.service'
import { z } from 'zod'

import { ProductService } from '../services/create-product.service'

const handleProductCreatedSchema = z.object({
  productID: z.string(),
  createdAt: z.preprocess((val) => new Date(val as string), z.date()),
  updatedAt: z.preprocess((val) => new Date(val as string), z.date())
})

@Controller()
export class ProductController {
  constructor(
    private readonly kafkaConsumerService: KafkaConsumerService,
    private readonly productService: ProductService
  ) {}

  @KafkaMessagePattern(KAFKA_TOPICS.PRODUCT_CREATED)
  public async handleProductCreated(@Payload() message: unknown) {
    console.log(message)
    console.log('subscribed to product created topic:', KAFKA_TOPICS.PRODUCT_CREATED)
    console.log('Product created event received:', message)
    const parsedMessage = await handleProductCreatedSchema.safeParseAsync(message)
    if (!parsedMessage.success) throw new Error('Invalid message: ' + parsedMessage.error.message)
    const resultCreateProduct = await this.productService.createProduct({
      product: {
        createdAt: parsedMessage.data.createdAt,
        updatedAt: parsedMessage.data.updatedAt,
        id: parsedMessage.data.productID,
        deletedAt: null
      }
    })
    if (resultCreateProduct.isFailure())
      throw new Error('Error creating product, message error: ' + resultCreateProduct.value.message)
  }
}

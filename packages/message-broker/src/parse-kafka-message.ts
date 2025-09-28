import { type Either, failure, success } from '@niki/utils'
import { type KafkaMessage } from 'kafkajs'
import { type z } from 'zod'

export function parseKafkaMessage<Payload>(parameters: {
  message: KafkaMessage
  schema: z.ZodType<Payload>
}): Either<Error, Payload> {
  const { message, schema } = parameters
  try {
    const rawValue = message.value
    if (!rawValue) return failure(new Error('Message value is null or undefined'))
    const messageString = rawValue.toString()
    if (!messageString) return failure(new Error('Message string is empty'))
    const json: unknown = JSON.parse(messageString)
    const result = schema.safeParse(json)
    return result.success
      ? success(result.data)
      : failure(new Error('Schema validation failed', { cause: result.error }))
  } catch (error: unknown) {
    return failure(
      new Error('Unexpected error parsing message', {
        cause: error instanceof Error ? error : new Error(String(error))
      })
    )
  }
}

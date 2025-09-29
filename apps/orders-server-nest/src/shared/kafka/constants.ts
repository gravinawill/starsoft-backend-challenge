export const KAFKA_TOPICS = {
  USER_CREATED: 'users.customer.created',

  ORDER_CREATED: 'orders.order.created',

  PRODUCT_CREATED: 'products.created'
} as const

export type KafkaTopic = (typeof KAFKA_TOPICS)[keyof typeof KAFKA_TOPICS]

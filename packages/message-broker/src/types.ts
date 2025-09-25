export type KafkaConfig = {
  clientID: string
  brokers: string[]
  ssl?: boolean
  sasl?: {
    mechanism: 'plain' | 'scram-sha-256' | 'scram-sha-512'
    username: string
    password: string
  }
}

export type ProducerConfig = KafkaConfig & {
  retries?: number
  retry?: {
    initialRetryTime: number
    retries: number
  }
}

export type ConsumerConfig = KafkaConfig & {
  groupId: string
  sessionTimeout?: number
  rebalanceTimeout?: number
  heartbeatInterval?: number
  maxBytesPerPartition?: number
  minBytes?: number
  maxBytes?: number
  maxWaitTimeInMs?: number
  retry?: {
    retries: number
    initialRetryTime: number
  }
}

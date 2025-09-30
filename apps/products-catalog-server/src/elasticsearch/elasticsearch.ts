import { Client } from '@elastic/elasticsearch'
import { productsCatalogServerENV } from '@niki/env'
import { makeLoggerProvider } from '@niki/logger'
import { type Either, failure, success } from '@niki/utils'

type ElasticsearchConfig = {
  host: string
  indexName: string
  requestTimeout: number
  maxRetries: number
  maxConnections: number
  keepAlive: boolean
  keepAliveInterval: number
}

export class Elasticsearch {
  private static instance: Elasticsearch | null = null
  private readonly client: Client
  private readonly config: ElasticsearchConfig
  private readonly logger = makeLoggerProvider()
  private isConnected = false
  private lastHealthCheck = 0
  private readonly healthCheckInterval = 30_000 // 30 seconds
  private consecutiveFailures = 0
  private readonly maxConsecutiveFailures = 3
  private readonly circuitBreakerTimeout = 60_000 // 1 minute
  private circuitBreakerOpen = false
  private circuitBreakerOpenTime = 0
  private healthCheckTimer: NodeJS.Timeout | null = null

  private constructor() {
    this.config = {
      host: productsCatalogServerENV.ELASTICSEARCH_HOST,
      indexName: productsCatalogServerENV.ELASTICSEARCH_INDEX_PRODUCTS,
      requestTimeout: productsCatalogServerENV.ELASTICSEARCH_REQUEST_TIMEOUT,
      maxRetries: productsCatalogServerENV.ELASTICSEARCH_MAX_RETRIES,
      maxConnections: 10,
      keepAlive: true,
      keepAliveInterval: 30_000
    }
    this.client = new Client({
      node: this.config.host,
      requestTimeout: this.config.requestTimeout,
      maxRetries: this.config.maxRetries
    })
    this.startHealthMonitoring()
  }

  public static getInstance(): Elasticsearch {
    Elasticsearch.instance ??= new Elasticsearch()
    return Elasticsearch.instance
  }

  public getClient(): Client {
    return this.client
  }

  public getConfig(): ElasticsearchConfig {
    return this.config
  }

  public isHealthy(): boolean {
    const isRecentCheck = Date.now() - this.lastHealthCheck < this.healthCheckInterval
    const isNotCircuitBreakerOpen =
      !this.circuitBreakerOpen || Date.now() - this.circuitBreakerOpenTime > this.circuitBreakerTimeout

    return this.isConnected && isRecentCheck && isNotCircuitBreakerOpen
  }

  public getHealthStatus(): {
    isConnected: boolean
    isHealthy: boolean
    lastHealthCheck: number
    consecutiveFailures: number
    circuitBreakerOpen: boolean
    timeSinceLastCheck: number
  } {
    return {
      isConnected: this.isConnected,
      isHealthy: this.isHealthy(),
      lastHealthCheck: this.lastHealthCheck,
      consecutiveFailures: this.consecutiveFailures,
      circuitBreakerOpen: this.circuitBreakerOpen,
      timeSinceLastCheck: Date.now() - this.lastHealthCheck
    }
  }

  public async healthCheck(): Promise<
    Either<
      { name: string; message: string },
      {
        health: string
        clusterName: string
        numberOfNodes: number
        activeShards: number
        relocatingShards: number
        initializingShards: number
        unassignedShards: number
        timedOut: boolean
        responseTime: number
      }
    >
  > {
    const startTime = Date.now()

    if (this.circuitBreakerOpen) {
      const timeSinceOpen = Date.now() - this.circuitBreakerOpenTime
      if (timeSinceOpen < this.circuitBreakerTimeout) {
        this.logger.sendLogWarn({
          message: 'Elasticsearch health check skipped - circuit breaker is open',
          data: {
            timeSinceOpen,
            circuitBreakerTimeout: this.circuitBreakerTimeout,
            consecutiveFailures: this.consecutiveFailures
          }
        })
        return failure({
          name: 'CircuitBreakerOpen',
          message: `Circuit breaker is open. Time since open: ${timeSinceOpen}ms`
        })
      } else {
        this.circuitBreakerOpen = false
        this.consecutiveFailures = 0
        this.logger.sendLogInfo({
          message: 'Elasticsearch circuit breaker reset - attempting health check'
        })
      }
    }

    try {
      const healthCheckPromise = this.client.cluster.health({
        timeout: '10s',
        wait_for_status: 'yellow'
      })

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Health check timeout'))
        }, 15_000)
      })

      const health = await Promise.race([healthCheckPromise, timeoutPromise])
      const responseTime = Date.now() - startTime

      // Reset failure counter on success
      this.consecutiveFailures = 0
      this.isConnected = true
      this.lastHealthCheck = Date.now()
      this.circuitBreakerOpen = false

      const healthData = {
        status: health.status,
        clusterName: health.cluster_name,
        numberOfNodes: health.number_of_nodes,
        activeShards: health.active_shards,
        relocatingShards: health.relocating_shards,
        initializingShards: health.initializing_shards,
        unassignedShards: health.unassigned_shards,
        timedOut: health.timed_out,
        responseTime
      }

      this.logger.sendLogInfo({
        message: `Elasticsearch cluster health: ${health.status}`,
        data: healthData
      })

      return success({
        health: health.status,
        clusterName: health.cluster_name,
        numberOfNodes: health.number_of_nodes,
        activeShards: health.active_shards,
        relocatingShards: health.relocating_shards,
        initializingShards: health.initializing_shards,
        unassignedShards: health.unassigned_shards,
        timedOut: health.timed_out,
        responseTime
      })
    } catch (error) {
      const responseTime = Date.now() - startTime
      this.consecutiveFailures++
      this.isConnected = false

      // Open circuit breaker if too many consecutive failures
      if (this.consecutiveFailures >= this.maxConsecutiveFailures) {
        this.circuitBreakerOpen = true
        this.circuitBreakerOpenTime = Date.now()
        this.logger.sendLogError({
          message: 'Elasticsearch circuit breaker opened due to consecutive failures',
          value: {
            consecutiveFailures: this.consecutiveFailures,
            maxConsecutiveFailures: this.maxConsecutiveFailures,
            responseTime
          }
        })
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      this.logger.sendLogError({
        message: 'Failed to connect to Elasticsearch',
        value: {
          error: errorMessage,
          consecutiveFailures: this.consecutiveFailures,
          responseTime,
          circuitBreakerOpen: this.circuitBreakerOpen
        }
      })

      return failure({
        name: 'ElasticsearchError',
        message: `Failed to connect to Elasticsearch: ${errorMessage}`
      })
    }
  }

  private startHealthMonitoring(): void {
    this.performBackgroundHealthCheck()
    this.healthCheckTimer = setInterval(() => {
      this.performBackgroundHealthCheck()
    }, this.healthCheckInterval)
  }

  private async performBackgroundHealthCheck(): Promise<void> {
    try {
      const result = await this.healthCheck()
      if (result.isFailure()) {
        this.logger.sendLogWarn({
          message: 'Background health check failed',
          data: {
            error: result.value,
            healthStatus: this.getHealthStatus()
          }
        })
      }
    } catch (error) {
      this.logger.sendLogError({
        message: 'Background health check threw an error',
        value: { error }
      })
    }
  }

  public stopHealthMonitoring(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer)
      this.healthCheckTimer = null
      this.logger.sendLogInfo({
        message: 'Elasticsearch health monitoring stopped'
      })
    }
  }

  public async forceHealthCheck(): Promise<
    Either<
      { name: string; message: string },
      {
        health: string
        clusterName: string
        numberOfNodes: number
        activeShards: number
        relocatingShards: number
        initializingShards: number
        unassignedShards: number
        timedOut: boolean
        responseTime: number
      }
    >
  > {
    const originalCircuitBreakerState = this.circuitBreakerOpen
    this.circuitBreakerOpen = false
    const result = await this.healthCheck()
    if (originalCircuitBreakerState) this.circuitBreakerOpen = true
    return result
  }
}

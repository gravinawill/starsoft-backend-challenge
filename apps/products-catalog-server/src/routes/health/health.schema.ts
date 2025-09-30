import { z } from '@hono/zod-openapi'

export const HealthStatusSchema = z.enum(['healthy', 'degraded', 'unhealthy']).openapi({
  description: 'Overall health status of the service'
})

export const ServiceStatusSchema = z.enum(['healthy', 'unhealthy']).openapi({
  description: 'Status of individual services'
})

export const ElasticsearchDetailsSchema = z
  .object({
    health: z.string().openapi({
      example: 'green',
      description: 'Elasticsearch cluster health status'
    }),
    clusterName: z.string().openapi({
      example: 'elasticsearch',
      description: 'Name of the Elasticsearch cluster'
    }),
    numberOfNodes: z.number().openapi({
      example: 3,
      description: 'Number of nodes in the cluster'
    }),
    activeShards: z.number().openapi({
      example: 10,
      description: 'Number of active shards'
    }),
    relocatingShards: z.number().openapi({
      example: 0,
      description: 'Number of relocating shards'
    }),
    initializingShards: z.number().openapi({
      example: 0,
      description: 'Number of initializing shards'
    }),
    unassignedShards: z.number().openapi({
      example: 0,
      description: 'Number of unassigned shards'
    }),
    timedOut: z.boolean().openapi({
      example: false,
      description: 'Whether the health check timed out'
    }),
    responseTime: z.number().openapi({
      example: 45,
      description: 'Response time in milliseconds'
    })
  })
  .openapi('ElasticsearchDetails')

export const ServiceHealthSchema = z
  .object({
    status: ServiceStatusSchema,
    details: z
      .union([
        ElasticsearchDetailsSchema,
        z.object({
          error: z.string().openapi({
            example: 'Connection failed',
            description: 'Error message when service is unhealthy'
          })
        })
      ])
      .openapi({
        description: 'Detailed information about the service health'
      })
  })
  .openapi('ServiceHealth')

export const MemoryUsageSchema = z
  .object({
    used: z.number().openapi({
      example: 128,
      description: 'Used memory in MB'
    }),
    total: z.number().openapi({
      example: 512,
      description: 'Total memory in MB'
    }),
    external: z.number().openapi({
      example: 16,
      description: 'External memory in MB'
    })
  })
  .openapi('MemoryUsage')

export const HealthResponseSchema = z
  .object({
    status: HealthStatusSchema,
    timestamp: z.string().openapi({
      example: '2024-01-15T10:30:00Z',
      description: 'Timestamp of the health check'
    }),
    environment: z.string().openapi({
      example: 'production',
      description: 'Environment name'
    }),
    version: z.string().openapi({
      example: '1.0.0',
      description: 'Application version'
    }),
    responseTime: z.string().openapi({
      example: '45ms',
      description: 'Total response time'
    }),
    error: z.string().optional().openapi({
      description: 'Error message if any'
    }),
    services: z
      .object({
        elasticsearch: ServiceHealthSchema
      })
      .openapi({
        description: 'Health status of all services'
      }),
    uptime: z.number().openapi({
      example: 3600,
      description: 'Server uptime in seconds'
    }),
    memory: MemoryUsageSchema
  })
  .openapi('HealthResponse')

export const UnhealthyHealthResponseSchema = z
  .object({
    status: z.string().openapi({
      example: 'unhealthy',
      description: 'Overall health status of the service'
    }),
    timestamp: z.string(),
    environment: z.string(),
    version: z.string(),
    responseTime: z.string(),
    error: z.string(),
    services: z.object({
      elasticsearch: z.object({
        status: z.string().openapi({
          example: 'unhealthy',
          description: 'Status of the service'
        }),
        details: z.object({
          error: z.string()
        })
      })
    })
  })
  .openapi('UnhealthyHealthResponse')

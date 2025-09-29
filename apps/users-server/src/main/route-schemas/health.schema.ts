import { schemaRegistry } from '@main/docs/openapi.docs'
import { z } from 'zod'

export const HealthCheckResponseSchema = z
  .object({
    status: z
      .enum(['ok', 'not_ready'])
      .describe('Service health status: "ok" if healthy, "not_ready" if not yet ready')
      .register(schemaRegistry, {
        id: 'health_status',
        title: 'Health Status',
        description: 'Current service health status indicating if the service is operational',
        example: 'ok'
      }),
    uptime: z
      .number()
      .nonnegative()
      .describe('Service uptime in seconds since the last restart')
      .register(schemaRegistry, {
        id: 'health_uptime',
        title: 'Uptime',
        description: 'Service uptime in seconds since the last restart or deployment',
        example: 12_345.67
      }),
    timestamp: z.iso
      .datetime()
      .describe('ISO 8601 timestamp of when the health check was performed')
      .register(schemaRegistry, {
        id: 'health_timestamp',
        title: 'Timestamp',
        description: 'ISO 8601 formatted timestamp of when the health check was performed',
        example: '2024-06-01T12:34:56.789Z'
      }),
    environment: z
      .string()
      .describe('Service environment identifier (development, production, staging, etc.)')
      .register(schemaRegistry, {
        id: 'health_environment',
        title: 'Environment',
        description: 'Current deployment environment where the service is running',
        example: 'production'
      }),
    version: z
      .string()
      .describe('Service version identifier (semantic versioning recommended)')
      .register(schemaRegistry, {
        id: 'health_version',
        title: 'Version',
        description: 'Current version of the service (semantic versioning recommended)',
        example: '1.0.0'
      })
  })
  .register(schemaRegistry, {
    id: 'HealthCheckResponse',
    title: 'Health Check Response',
    description: 'Comprehensive health check response containing service status, uptime, and metadata'
  })

export type HealthCheckResponse = z.infer<typeof HealthCheckResponseSchema>

import { notificationServerENV } from '@niki/env'
import { makeLoggerProvider } from '@niki/logger'

import { setupEvents } from './setup/events.setup'
import { createFastifyApp } from './setup/fastify.setup'

const logger = makeLoggerProvider()

async function startApplication(): Promise<void> {
  const startTime = Date.now()
  try {
    logger.sendLogInfo({
      message: '🚀 Starting Notification Server',
      data: {
        nodeVersion: process.version,
        environment: process.env.NODE_ENV ?? 'development',
        pid: process.pid,
        timestamp: new Date().toISOString()
      }
    })
    const app = createFastifyApp()
    await setupEvents()
    await app.listen({
      host: '0.0.0.0',
      port: notificationServerENV.NOTIFICATION_SERVER_PORT
    })
    logger.sendLogInfo({
      message: '🌐 HTTP API started successfully',
      data: {
        port: notificationServerENV.NOTIFICATION_SERVER_PORT,
        healthCheck: `http://localhost:${notificationServerENV.NOTIFICATION_SERVER_PORT}/health`
      }
    })
  } catch (error) {
    logger.sendLogError({
      message: '💥 Failed to start notification server',
      value: {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        startupTimeMs: Date.now() - startTime
      }
    })

    throw new Error('Failed to start notification server')
  }
}

await startApplication()

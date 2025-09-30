import { notificationServerENV } from '@niki/env'
import { makeLoggerProvider } from '@niki/logger'

import { setupEvents } from './setup/events.setup'
import { createFastifyApp } from './setup/fastify.setup'

const logger = makeLoggerProvider()

async function startApplication(): Promise<void> {
  const startTime = Date.now()
  try {
    logger.sendLogInfo({ message: '🚀 Starting Notification Server' })
    const app = createFastifyApp()
    await setupEvents()
    await app.listen({
      host: '0.0.0.0',
      port: notificationServerENV.NOTIFICATION_SERVER_PORT
    })
    logger.sendLogInfo({
      message: `🌐 HTTP API started successfully on port ${notificationServerENV.NOTIFICATION_SERVER_PORT}`
    })
  } catch (error) {
    console.log({ error })
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

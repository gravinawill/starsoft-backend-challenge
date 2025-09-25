import { usersServerENV } from '@niki/env'
import { makeLoggerProvider } from '@niki/logger'

import { buildServer } from './app'
import { type FastifyTypedInstance } from './docs/openapi.docs'

let server: FastifyTypedInstance | undefined

async function start(): Promise<void> {
  const logger = makeLoggerProvider()
  try {
    server = await buildServer()
    await server.listen({
      host: '0.0.0.0',
      port: usersServerENV.USERS_SERVER_PORT
    })
    logger.sendLogInfo({
      message: `[USERS-SERVER] HTTP Server running at port ${usersServerENV.USERS_SERVER_PORT}`
    })
    logger.sendLogInfo({
      message: `[USERS-SERVER] API Documentation available at http://localhost:${usersServerENV.USERS_SERVER_PORT}/docs`
    })
  } catch (error) {
    logger.sendLogError({
      message: 'Failed to start server',
      value: error
    })
    throw error
  }
}

const gracefulShutdown = async (signal: string): Promise<void> => {
  makeLoggerProvider().sendLogInfo({
    message: `[USERS-SERVER] Received ${signal}. Shutting down gracefully...`
  })
  if (server) {
    try {
      await server.close()
      makeLoggerProvider().sendLogInfo({
        message: 'Server closed successfully'
      })
    } catch (closeError) {
      makeLoggerProvider().sendLogError({
        message: 'Error during server shutdown',
        value: closeError
      })
    }
  }
}

process.on('SIGTERM', () => void gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => void gracefulShutdown('SIGINT'))

try {
  await start()
} catch (error) {
  makeLoggerProvider().sendLogError({
    message: 'Failed to start application',
    value: error
  })
}

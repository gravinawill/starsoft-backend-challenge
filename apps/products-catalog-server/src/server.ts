import { serve } from '@hono/node-server'
import { productsCatalogServerENV } from '@niki/env'
import { makeLoggerProvider } from '@niki/logger'

import { buildApp } from './app'

class Server {
  private logger = makeLoggerProvider()
  private server: ReturnType<typeof serve> | null = null
  private isShuttingDown = false

  async start(): Promise<void> {
    try {
      this.logger.sendLogInfo({ message: `Starting server...` })
      const app = buildApp()
      this.server = serve({ fetch: app.fetch, port: productsCatalogServerENV.PRODUCTS_CATALOG_SERVER_PORT })
      this.logger.sendLogInfo({
        message: `Server started successfully on port ${productsCatalogServerENV.PRODUCTS_CATALOG_SERVER_PORT}`
      })
      this.logger.sendLogInfo({
        message: `Server started successfully on port http://localhost:${productsCatalogServerENV.PRODUCTS_CATALOG_SERVER_PORT}/docs`
      })
      this.setupGracefulShutdown()
    } catch (error) {
      this.logger.sendLogError({ message: 'Failed to start server', value: error })
      await this.gracefulShutdown('startup-error')
      throw error
    }
  }

  private setupGracefulShutdown(): void {
    const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM']
    for (const signal of signals) {
      process.on(signal, async () => {
        if (this.isShuttingDown) return
        this.logger.sendLogInfo({ message: `Received ${signal}, initiating graceful shutdown...` })
        await this.gracefulShutdown(signal)
      })
    }

    process.on('uncaughtException', async (error) => {
      this.logger.sendLogError({ message: 'Uncaught exception occurred', value: error })
      await this.gracefulShutdown('uncaught-exception')
    })
    process.on('unhandledRejection', async (reason) => {
      this.logger.sendLogError({
        message: 'Unhandled promise rejection occurred',
        value: reason
      })
      await this.gracefulShutdown('unhandled-rejection')
    })
  }

  private async gracefulShutdown(reason: string): Promise<void> {
    try {
      if (this.isShuttingDown) return
      this.isShuttingDown = true
      this.logger.sendLogInfo({
        message: `Graceful shutdown initiated...`,
        data: { reason }
      })
      if (this.server) {
        await new Promise<void>((resolve) => {
          this.server!.close(() => {
            this.logger.sendLogInfo({ message: 'HTTP server closed' })
            resolve()
          })
        })
      }
      this.logger.sendLogInfo({ message: 'Graceful shutdown completed successfully' })
      // eslint-disable-next-line unicorn/no-process-exit -- graceful shutdown requires process exit
      process.exit(0)
    } catch (error) {
      this.logger.sendLogError({
        message: 'Error during graceful shutdown',
        value: error
      })
      // eslint-disable-next-line unicorn/no-process-exit -- error during shutdown requires process exit
      process.exit(1)
    }
  }
}

const server = new Server()
await server.start()

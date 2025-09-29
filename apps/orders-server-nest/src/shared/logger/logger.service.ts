import { Injectable, Scope } from '@nestjs/common'
import { createLogger, Logger, transports } from 'winston'

type LogMeta = Record<string, unknown> | undefined

@Injectable({ scope: Scope.TRANSIENT })
export class AppLogger {
  private context?: string
  private logger: Logger

  constructor() {
    this.logger = createLogger({
      transports: [new transports.Console()]
    })
  }

  public setContext(context: string): void {
    this.context = context
  }

  private getLogPayload(parameters: { message: string; meta?: LogMeta }): Record<string, unknown> {
    return {
      message: parameters.message,
      contextName: this.context,
      timestamp: new Date().toISOString(),
      ...parameters.meta
    }
  }

  error(params: { message: string; meta?: LogMeta }): Logger {
    return this.logger.error(this.getLogPayload(params))
  }

  warn(params: { message: string; meta?: LogMeta }): Logger {
    return this.logger.warn(this.getLogPayload(params))
  }

  debug(params: { message: string; meta?: LogMeta }): Logger {
    return this.logger.debug(this.getLogPayload(params))
  }

  verbose(params: { message: string; meta?: LogMeta }): Logger {
    return this.logger.verbose(this.getLogPayload(params))
  }

  log(params: { message: string; meta?: LogMeta }): Logger {
    return this.logger.info(this.getLogPayload(params))
  }
}

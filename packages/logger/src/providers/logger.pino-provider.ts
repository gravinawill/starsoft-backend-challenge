import {
  type ILoggerProvider,
  type SendLogErrorLoggerProviderDTO,
  type SendLogEventConsumerLoggerProviderDTO,
  type SendLogInfoLoggerProviderDTO,
  type SendLogTimeControllerLoggerProviderDTO,
  type SendLogTimeUseCaseLoggerProviderDTO,
  type SendLogWarnLoggerProviderDTO
} from '@niki/domain'
import pino, { type Logger, type LoggerOptions } from 'pino'

export class PinoLoggerProvider implements ILoggerProvider {
  private static instance: PinoLoggerProvider | null = null

  private readonly logger: Logger

  private constructor() {
    const loggerOptions: LoggerOptions = {
      level: 'info',
      ...(process.env.LOG_FORMAT === 'json'
        ? {
            // JSON structured logging
            formatters: {
              level: (label) => ({ level: label }),
              bindings: (bindings) => ({
                pid: bindings.pid,
                hostname: bindings.hostname
              })
            }
          }
        : {
            // Pretty logging
            transport: {
              targets: [
                {
                  target: 'pino-pretty',
                  level: 'info',
                  options: {
                    colorize: true,
                    levelFirst: true,
                    translateTime: 'yyyy-mm-dd HH:MM:ss Z',
                    ignore: 'pid,hostname',
                    messageFormat: '[{requestId}] {msg}',
                    singleLine: false,
                    hideObject: false
                  }
                }
              ]
            }
          })
    }

    this.logger = pino(loggerOptions)
  }

  public sendLogWarn(parameters: SendLogWarnLoggerProviderDTO.Parameters): SendLogWarnLoggerProviderDTO.Result {
    this.logger.warn(this.formatLogData(parameters))
    return null
  }

  public static getInstance(): PinoLoggerProvider {
    PinoLoggerProvider.instance ??= new PinoLoggerProvider()
    return PinoLoggerProvider.instance
  }

  private formatLogData(data: Record<string, unknown>) {
    const { message, ...rest } = data

    // Flatten data object for better structured logging
    const flattenedData = this.flattenObject(rest)

    return {
      ...flattenedData,
      msg: message,
      timestamp: new Date().toISOString()
    }
  }

  private flattenObject(obj: Record<string, unknown>, prefix = ''): Record<string, unknown> {
    const flattened: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key

      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        Object.assign(flattened, this.flattenObject(value as Record<string, unknown>, newKey))
      } else {
        flattened[newKey] = value
      }
    }

    return flattened
  }

  public sendLogInfo(parameters: SendLogInfoLoggerProviderDTO.Parameters): SendLogInfoLoggerProviderDTO.Result {
    this.logger.info(this.formatLogData(parameters))
    return null
  }

  public sendLogError(parameters: SendLogErrorLoggerProviderDTO.Parameters): SendLogErrorLoggerProviderDTO.Result {
    const { value: error, ...otherParams } = parameters
    let errorMessage: string
    let stack: string | undefined
    let errorType: string | undefined

    if (error instanceof Error) {
      errorMessage = error.message
      stack = error.stack
      errorType = error.name
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = (error as { message: string }).message
      errorType = (error as { name?: string }).name ?? 'UnknownError'
      stack = (error as { stack?: string }).stack
    } else {
      if (error) {
        errorMessage = typeof error === 'string' ? error : JSON.stringify(error)
      } else {
        errorMessage = 'Unknown error occurred'
      }
      errorType = 'UnknownError'
    }

    const logData = {
      ...this.formatLogData(otherParams),
      error: {
        message: errorMessage,
        type: errorType,
        ...(stack && { stack })
      }
    }

    this.logger.error(logData)
    return null
  }

  public sendLogTimeController(
    parameters: SendLogTimeControllerLoggerProviderDTO.Parameters
  ): SendLogTimeControllerLoggerProviderDTO.Result {
    this.logger.info(this.formatLogData(parameters))
    return null
  }

  public sendLogTimeUseCase(
    parameters: SendLogTimeUseCaseLoggerProviderDTO.Parameters
  ): SendLogTimeUseCaseLoggerProviderDTO.Result {
    this.logger.info(this.formatLogData(parameters))
    return null
  }

  public sendLogEventConsumer(
    parameters: SendLogEventConsumerLoggerProviderDTO.Parameters
  ): SendLogEventConsumerLoggerProviderDTO.Result {
    this.logger.info(this.formatLogData(parameters))
    return null
  }
}

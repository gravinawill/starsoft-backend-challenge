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
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      transport: {
        targets: [
          {
            target: 'pino-pretty',
            level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
            options: {
              name: 'dev-terminal',
              colorize: true,
              levelFirst: true,
              include: 'level,time',
              translateTime: 'yyyy-mm-dd HH:MM:ss Z'
            }
          }
        ]
      }
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

  private formatLogData<T extends Record<string, unknown>>(data: T) {
    const { message, ...rest } = data
    return {
      ...rest,
      msg: message
    }
  }

  public sendLogInfo(parameters: SendLogInfoLoggerProviderDTO.Parameters): SendLogInfoLoggerProviderDTO.Result {
    this.logger.info(this.formatLogData(parameters))
    return null
  }

  public sendLogError(parameters: SendLogErrorLoggerProviderDTO.Parameters): SendLogErrorLoggerProviderDTO.Result {
    /*
     * const { value: error, ...otherParams } = parameters
     * let msg: string
     * let stack: string | undefined
     */

    /*
     * if (error instanceof Error) {
     *   msg = error.message
     *   stack = error.stack
     * } else {
     *   msg = error ? ((error as { errorMessage?: string }).errorMessage ?? String(error as unknown)) : String(error)
     *   stack = undefined
     * }
     */
    this.logger.error(parameters.message)
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

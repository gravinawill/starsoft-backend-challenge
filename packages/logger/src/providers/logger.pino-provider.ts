import {
  type ISendLogErrorLoggerProvider,
  type ISendLogInfoLoggerProvider,
  type ISendLogTimeControllerLoggerProvider,
  type ISendLogTimeUseCaseLoggerProvider,
  type SendLogErrorLoggerProviderDTO,
  type SendLogInfoLoggerProviderDTO,
  type SendLogTimeControllerLoggerProviderDTO,
  type SendLogTimeUseCaseLoggerProviderDTO
} from '@niki/domain'
import pino, { type Logger, type LoggerOptions } from 'pino'

export class PinoLoggerProvider
  implements
    ISendLogErrorLoggerProvider,
    ISendLogInfoLoggerProvider,
    ISendLogTimeUseCaseLoggerProvider,
    ISendLogTimeControllerLoggerProvider
{
  private static instance: PinoLoggerProvider | null = null

  private readonly logger: Logger

  private constructor() {
    const loggerOptions: LoggerOptions = {
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      transport: {
        targets: [
          {
            target: 'pino-pretty',
            level: 'error',
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
    const { value: error, ...otherParams } = parameters
    let msg: string
    let stack: string | undefined

    if (error instanceof Error) {
      msg = error.message
      stack = error.stack
    } else {
      msg = error ? ((error as { errorMessage?: string }).errorMessage ?? String(error as unknown)) : String(error)
      stack = undefined
    }

    const logData = {
      msg,
      stack,
      ...otherParams
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
}

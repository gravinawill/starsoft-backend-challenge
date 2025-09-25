import {
  type ISendLogErrorLoggerProvider,
  type ISendLogInfoLoggerProvider,
  type ISendLogTimeControllerLoggerProvider,
  type ISendLogTimeUseCaseLoggerProvider,
  type ISendLogWarnLoggerProvider
} from '@niki/domain'

import { PinoLoggerProvider } from './providers/logger.pino-provider'

export const makeLoggerProvider = (): ISendLogErrorLoggerProvider &
  ISendLogTimeControllerLoggerProvider &
  ISendLogTimeUseCaseLoggerProvider &
  ISendLogWarnLoggerProvider &
  ISendLogInfoLoggerProvider => {
  return PinoLoggerProvider.getInstance()
}

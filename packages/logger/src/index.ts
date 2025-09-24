import type {
  ISendLogErrorLoggerProvider,
  ISendLogInfoLoggerProvider,
  ISendLogTimeControllerLoggerProvider,
  ISendLogTimeUseCaseLoggerProvider
} from '@niki/domain'

import { PinoLoggerProvider } from './providers/logger.pino-provider'

export const makeLoggerProvider = (): ISendLogErrorLoggerProvider &
  ISendLogTimeControllerLoggerProvider &
  ISendLogTimeUseCaseLoggerProvider &
  ISendLogInfoLoggerProvider => {
  return PinoLoggerProvider.getInstance()
}

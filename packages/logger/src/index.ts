import { type ILoggerProvider } from '@niki/domain'

import { PinoLoggerProvider } from './providers/logger.pino-provider'

export const makeLoggerProvider = (): ILoggerProvider => PinoLoggerProvider.getInstance()

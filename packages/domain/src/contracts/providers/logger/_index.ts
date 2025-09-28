import { type ISendLogErrorLoggerProvider } from './send-log-error.logger-provider'
import { type ISendLogEventConsumerLoggerProvider } from './send-log-event-consumer.logger-provider'
import { type ISendLogInfoLoggerProvider } from './send-log-info.logger-provider'
import { type ISendLogTimeControllerLoggerProvider } from './send-log-time-controller.logger-provider'
import { type ISendLogTimeUseCaseLoggerProvider } from './send-log-time-use-case.logger-provider'
import { type ISendLogWarnLoggerProvider } from './send-log-warn.logger-provider'

export type ILoggerProvider = ISendLogErrorLoggerProvider &
  ISendLogInfoLoggerProvider &
  ISendLogTimeControllerLoggerProvider &
  ISendLogTimeUseCaseLoggerProvider &
  ISendLogWarnLoggerProvider &
  ISendLogEventConsumerLoggerProvider

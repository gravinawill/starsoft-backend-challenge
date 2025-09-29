type Start = {
  maxRetries: number
}

type Attempt = {
  attempt: number
  maxRetries: number
}

type StopWithSuccess = {
  runtimeInMs: number
  totalAttempts: number
}

type StopWithFailureAndNextRetryIn = {
  runtimeInMs: number
  totalAttempts: number
  maxRetries: number
  errorMessage: string
  nextRetryInMs: string
}

type StopWithError = {
  errorMessage: string
  totalAttempts: number
  maxRetries: number
  runtimeInMs: number
}

export namespace SendLogEventConsumerLoggerProviderDTO {
  export type Parameters = Readonly<
    {
      consumerName: string
      message: string
      nowInISOString: string
    } & (
      | {
          type: 'start'
          start: Start
        }
      | {
          type: 'attempt'
          attempt: Attempt
        }
      | {
          type: 'stopWithSuccess'
          stopWithSuccess: StopWithSuccess
        }
      | {
          type: 'stopWithFailureAndNextRetryIn'
          stopWithFailureAndNextRetryIn: StopWithFailureAndNextRetryIn
        }
      | {
          type: 'stopWithError'
          stopWithError: StopWithError
        }
    )
  >
  export type Result = Readonly<null>
}

export interface ISendLogEventConsumerLoggerProvider {
  sendLogEventConsumer(
    parameters: SendLogEventConsumerLoggerProviderDTO.Parameters
  ): SendLogEventConsumerLoggerProviderDTO.Result
}

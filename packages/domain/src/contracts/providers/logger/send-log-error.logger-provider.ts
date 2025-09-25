export namespace SendLogErrorLoggerProviderDTO {
  export type Parameters = Readonly<{
    message: string
    value: unknown
  }>
  export type Result = Readonly<null>
}

export interface ISendLogErrorLoggerProvider {
  sendLogError(parameters: SendLogErrorLoggerProviderDTO.Parameters): SendLogErrorLoggerProviderDTO.Result
}

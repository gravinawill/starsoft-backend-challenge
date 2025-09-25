export namespace SendLogWarnLoggerProviderDTO {
  export type Parameters = Readonly<{
    message: string
    data?: unknown
  }>
  export type Result = Readonly<null>
}

export interface ISendLogWarnLoggerProvider {
  sendLogWarn(parameters: SendLogWarnLoggerProviderDTO.Parameters): SendLogWarnLoggerProviderDTO.Result
}

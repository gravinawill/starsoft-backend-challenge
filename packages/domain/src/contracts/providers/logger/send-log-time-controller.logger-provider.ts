export namespace SendLogTimeControllerLoggerProviderDTO {
  export type Parameters = Readonly<{
    message: string
    runtimeInMs: number
    controllerName: string
    httpRequest: string
    httpResponse: string
    isSuccess: boolean
  }>
  export type Result = Readonly<null>
}

export interface ISendLogTimeControllerLoggerProvider {
  sendLogTimeController(
    parameters: SendLogTimeControllerLoggerProviderDTO.Parameters
  ): SendLogTimeControllerLoggerProviderDTO.Result
}

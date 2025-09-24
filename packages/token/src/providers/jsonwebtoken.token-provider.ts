import {
  type GenerateJWTTokenProviderDTO,
  ID,
  type IGenerateJWTTokenProvider,
  InvalidJWTError,
  type ISendLogErrorLoggerProvider,
  type IVerifyJWTTokenProvider,
  ProviderError,
  type VerifyJWTTokenProviderDTO
} from '@niki/domain'
import { failure, success } from '@niki/utils'
import jwt from 'jsonwebtoken'

interface ITokenJwtPayloadDTO {
  iat: number
  exp: number
  sub: string
}

export class JsonwebtokenTokenProvider implements IGenerateJWTTokenProvider, IVerifyJWTTokenProvider {
  constructor(
    private readonly loggerProvider: ISendLogErrorLoggerProvider,
    private readonly environments: {
      SECRET: string
      EXPIRES_IN_MINUTES: number
      ALGORITHM: 'HS256' | 'HS384' | 'HS512'
      ISSUER: string
    }
  ) {}

  public generateJWT(parameters: GenerateJWTTokenProviderDTO.Parameters): GenerateJWTTokenProviderDTO.Result {
    try {
      const { userID } = parameters
      const { SECRET, ISSUER, ALGORITHM, EXPIRES_IN_MINUTES } = this.environments

      const token = jwt.sign({}, SECRET, {
        subject: userID.value,
        issuer: ISSUER,
        expiresIn: `${EXPIRES_IN_MINUTES}minutes`,
        algorithm: ALGORITHM
      })

      return success({ jwtToken: token })
    } catch (error: unknown) {
      const errorProvider = new ProviderError({
        error,
        provider: {
          name: 'token',
          method: 'generate jwt',
          externalName: 'jsonwebtoken'
        }
      })
      this.loggerProvider.sendLogError({
        message: errorProvider.errorMessage,
        value: errorProvider
      })
      return failure(errorProvider)
    }
  }

  public verifyJWT(parameters: VerifyJWTTokenProviderDTO.Parameters): VerifyJWTTokenProviderDTO.Result {
    try {
      const decoded = jwt.verify(parameters.jwtToken, this.environments.SECRET, {
        algorithms: [this.environments.ALGORITHM]
      }) as ITokenJwtPayloadDTO

      const resultValidateID = ID.validate({
        id: decoded.sub,
        modelName: 'user'
      })

      if (resultValidateID.isFailure()) return failure(resultValidateID.value)

      return success({ userID: resultValidateID.value.idValidated })
    } catch (error: unknown) {
      if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
        return failure(
          new InvalidJWTError({
            message: 'Invalid JWT',
            error
          })
        )
      }
      const errorProvider = new ProviderError({
        error,
        provider: {
          name: 'token',
          method: 'verify jwt',
          externalName: 'jsonwebtoken'
        }
      })
      this.loggerProvider.sendLogError({
        message: errorProvider.errorMessage,
        value: errorProvider
      })
      return failure(errorProvider)
    }
  }
}

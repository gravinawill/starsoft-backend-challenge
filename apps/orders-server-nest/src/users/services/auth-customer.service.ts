import { Injectable } from '@nestjs/common'
import { AppLogger } from '@shared/logger/logger.service'
import { Either, failure, success } from '@utils/either.util'
import jwt from 'jsonwebtoken'

import { AuthenticationException } from '@/shared/exceptions/business.exception'

import { CustomerRepository } from '../infra/customers.repository'

type ITokenJwtPayloadDTO = {
  iat: number
  exp: number
  sub: string
}

@Injectable()
export class AuthCustomerService {
  constructor(
    private repository: CustomerRepository,
    private readonly logger: AppLogger
  ) {
    this.logger.setContext(AuthCustomerService.name)
  }

  async authCustomer(parameters: {
    accessToken: string | undefined
  }): Promise<Either<AuthenticationException, { customer: { id: string } }>> {
    try {
      if (!parameters.accessToken) return failure(new AuthenticationException('Valid Bearer token is required'))
      const accessToken = parameters.accessToken.split(' ')[1]
      if (!accessToken) return failure(new AuthenticationException('Valid Bearer token is required'))

      const decoded = jwt.verify(accessToken, process.env.TOKEN_PROVIDER_JWT_SECRET ?? '', {
        algorithms: [process.env.TOKEN_PROVIDER_JWT_ALGORITHM as 'HS256' | 'HS384' | 'HS512']
      }) as ITokenJwtPayloadDTO
      const resultValidateID = await this.repository.validateID({ id: decoded.sub })
      if (resultValidateID.isFailure()) return failure(new AuthenticationException(resultValidateID.value.message))
      return resultValidateID.value.foundCustomer
        ? success({ customer: { id: decoded.sub } })
        : failure(new AuthenticationException('Customer not found'))
    } catch (error: unknown) {
      this.logger.error({
        message: 'Invalid or expired JWT',
        meta: { error }
      })
      return failure(new AuthenticationException('Invalid or expired JWT'))
    }
  }
}

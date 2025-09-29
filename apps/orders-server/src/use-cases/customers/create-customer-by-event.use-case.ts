import { Customer } from '@models/customer.model'
import {
  ID,
  type InvalidIDError,
  type ISendLogErrorLoggerProvider,
  type ISendLogTimeUseCaseLoggerProvider,
  ModelName,
  type RepositoryError,
  UseCase,
  type UsersEmployeeCreatedEvent
} from '@niki/domain'
import { type Either, failure, success } from '@niki/utils'
import { type ISaveCustomersRepository } from '@repository-contracts/customers/save.customers-repository'
import { type IValidateIDCustomersRepository } from '@repository-contracts/customers/validate-id.customers-repository'

export namespace CreateCustomerByEventUseCaseDTO {
  export type Parameters = Readonly<{ parameters: { event: UsersEmployeeCreatedEvent['payload'] } }>

  export type ResultFailure = Readonly<InvalidIDError | RepositoryError>
  export type ResultSuccess = Readonly<null>

  export type Result = Promise<Either<ResultFailure, ResultSuccess>>
}

export class CreateCustomerByEventUseCase extends UseCase<
  CreateCustomerByEventUseCaseDTO.Parameters,
  CreateCustomerByEventUseCaseDTO.ResultFailure,
  CreateCustomerByEventUseCaseDTO.ResultSuccess
> {
  constructor(
    loggerProvider: ISendLogTimeUseCaseLoggerProvider & ISendLogErrorLoggerProvider,
    private readonly customersRepository: ISaveCustomersRepository & IValidateIDCustomersRepository
  ) {
    super(loggerProvider)
  }

  protected async performOperation(
    parameters: CreateCustomerByEventUseCaseDTO.Parameters
  ): CreateCustomerByEventUseCaseDTO.Result {
    const resultValidateID = ID.validate({ id: parameters.parameters.event.userID, modelName: ModelName.USER })
    if (resultValidateID.isFailure()) return failure(resultValidateID.value)
    const { idValidated: userID } = resultValidateID.value

    const resultValidateIDCustomer = await this.customersRepository.validateID({ customer: { id: userID } })
    if (resultValidateIDCustomer.isFailure()) return failure(resultValidateIDCustomer.value)

    const customer = new Customer({
      id: userID,
      createdAt: parameters.parameters.event.createdAt,
      updatedAt: parameters.parameters.event.updatedAt,
      deletedAt: null
    })

    const resultSaveCustomer = await this.customersRepository.save({ customer })
    if (resultSaveCustomer.isFailure()) return failure(resultSaveCustomer.value)

    return success(null)
  }
}

import { Customer } from '@models/customer.model'
import {
  ID,
  type InvalidIDError,
  type ISendLogErrorLoggerProvider,
  type ISendLogTimeUseCaseLoggerProvider,
  ModelName,
  type RepositoryError,
  UseCase,
  type UsersCustomerCreatedEventPayload
} from '@niki/domain'
import { type Either, failure, success } from '@niki/utils'
import { type ISaveCustomersRepository } from '@repository-contracts/customers/save.customers-repository'
import { type IValidateIDCustomersRepository } from '@repository-contracts/customers/validate-id.customers-repository'

export namespace CreateCustomerByEventUseCaseDTO {
  export type Parameters = Readonly<{ event: UsersCustomerCreatedEventPayload }>

  export type ResultFailure = Readonly<InvalidIDError | RepositoryError>
  export type ResultSuccess = Readonly<{ customerCreated: Pick<Customer, 'id'> }>

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
    const resultValidateID = ID.validate({ id: parameters.event.userID, modelName: ModelName.USER })
    if (resultValidateID.isFailure()) return failure(resultValidateID.value)
    const { idValidated: userID } = resultValidateID.value

    const resultValidateIDCustomer = await this.customersRepository.validateID({ customer: { id: userID } })
    if (resultValidateIDCustomer.isFailure()) return failure(resultValidateIDCustomer.value)
    const { foundCustomer } = resultValidateIDCustomer.value
    if (foundCustomer !== null) return success({ customerCreated: foundCustomer })

    const customer = new Customer({
      id: userID,
      name: parameters.event.name,
      createdAt: parameters.event.createdAt,
      updatedAt: parameters.event.updatedAt,
      deletedAt: null
    })

    const resultSaveCustomer = await this.customersRepository.save({ customer })
    if (resultSaveCustomer.isFailure()) return failure(resultSaveCustomer.value)

    return success({ customerCreated: customer })
  }
}

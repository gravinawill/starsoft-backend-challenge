import { type GenerateIDError, ID, ModelName } from '@niki/domain'
import { type Either, failure, success } from '@niki/utils'

import { type Employee } from './employee.model'

export class Product {
  public readonly id: ID
  public name: string
  public priceInCents: number
  public availableCount: number
  public unavailableCount: number
  public createdByEmployee: Pick<Employee, 'id'>
  public imageURL: string | null
  public readonly createdAt: Date
  public updatedAt: Date
  public deletedAt: Date | null

  private constructor(parameters: {
    id: ID
    name: string
    priceInCents: number
    availableCount: number
    unavailableCount: number
    createdByEmployee: Pick<Employee, 'id'>
    imageURL: string | null
    createdAt: Date
    updatedAt: Date
    deletedAt: Date | null
  }) {
    this.id = parameters.id
    this.name = parameters.name
    this.priceInCents = parameters.priceInCents
    this.availableCount = parameters.availableCount
    this.unavailableCount = parameters.unavailableCount
    this.createdByEmployee = parameters.createdByEmployee
    this.imageURL = parameters.imageURL
    this.createdAt = parameters.createdAt
    this.updatedAt = parameters.updatedAt
    this.deletedAt = parameters.deletedAt
  }

  public static create(parameters: {
    name: string
    priceInCents: number
    availableCount: number
    createdByEmployee: Pick<Employee, 'id'>
  }): Either<GenerateIDError, { productCreated: Product }> {
    const resultGenerateID = ID.generate({ modelName: ModelName.PRODUCT })
    if (resultGenerateID.isFailure()) return failure(resultGenerateID.value)
    const { idGenerated: productID } = resultGenerateID.value
    const now = new Date()
    return success({
      productCreated: new Product({
        name: parameters.name,
        priceInCents: parameters.priceInCents,
        availableCount: parameters.availableCount,
        createdByEmployee: parameters.createdByEmployee,
        imageURL: null,
        id: productID,
        unavailableCount: 0,
        createdAt: now,
        updatedAt: now,
        deletedAt: null
      })
    })
  }

  public reserve(parameters: { amount: number }): void {
    this.availableCount = this.availableCount - parameters.amount
    this.unavailableCount = this.unavailableCount + parameters.amount
    this.updatedAt = new Date()
  }

  public unreserve(parameters: { amount: number }): void {
    this.availableCount = this.availableCount + parameters.amount
    this.unavailableCount = this.unavailableCount - parameters.amount
    this.updatedAt = new Date()
  }
}

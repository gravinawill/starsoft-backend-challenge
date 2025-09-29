import { type ID } from '@niki/domain'

export class Product {
  public readonly id: ID
  public readonly createdAt: Date
  public updatedAt: Date
  public deletedAt: Date | null

  constructor(parameters: { id: ID; createdAt: Date; updatedAt: Date; deletedAt: Date | null }) {
    this.id = parameters.id
    this.createdAt = parameters.createdAt
    this.updatedAt = parameters.updatedAt
    this.deletedAt = parameters.deletedAt
  }
}

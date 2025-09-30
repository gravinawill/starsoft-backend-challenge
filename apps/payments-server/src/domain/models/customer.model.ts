import { type ID } from '@niki/domain'

export class Customer {
  public readonly id: ID
  public name: string
  public readonly createdAt: Date
  public updatedAt: Date
  public deletedAt: Date | null

  constructor(parameters: { id: ID; name: string; createdAt: Date; updatedAt: Date; deletedAt: Date | null }) {
    this.id = parameters.id
    this.name = parameters.name
    this.createdAt = parameters.createdAt
    this.updatedAt = parameters.updatedAt
    this.deletedAt = parameters.deletedAt
  }
}

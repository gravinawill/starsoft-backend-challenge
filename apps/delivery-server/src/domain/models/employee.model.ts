import { type ID } from '@niki/domain'

export class Employee {
  public readonly id: ID
  public name: string
  public readonly createdAt: Date
  public updatedAt: Date
  public deletedAt: Date | null

  private constructor(parameters: { id: ID; name: string; createdAt: Date; updatedAt: Date; deletedAt: Date | null }) {
    this.id = parameters.id
    this.name = parameters.name
    this.createdAt = parameters.createdAt
    this.updatedAt = parameters.updatedAt
    this.deletedAt = parameters.deletedAt
  }

  public static create(parameters: {
    id: ID
    name: string
    createdAt: Date
    updatedAt: Date
    deletedAt: Date | null
  }): { employeeCreated: Employee } {
    return {
      employeeCreated: new Employee({
        id: parameters.id,
        name: parameters.name,
        createdAt: parameters.createdAt,
        updatedAt: parameters.updatedAt,
        deletedAt: parameters.deletedAt
      })
    }
  }
}

import { type Employee } from '@models/employee.model'
import { STATUS_ERROR } from '@niki/domain'

export class EmployeeNotFoundError {
  public readonly errorMessage: string
  public readonly errorValue: unknown
  public readonly name: 'EmployeeNotFoundError'
  public readonly status: STATUS_ERROR

  constructor(parameters: { employee: Pick<Employee, 'id'> }) {
    this.errorMessage = 'The employee not found with the ID: ' + parameters.employee.id.value
    this.errorValue = { employee: parameters.employee }
    this.name = 'EmployeeNotFoundError'
    this.status = STATUS_ERROR.CONFLICT
  }
}

import { type Employee } from '@models/employee.model'
import { STATUS_ERROR } from '@niki/domain'

export class EmployeeAlreadyExistsError {
  public readonly errorMessage: string
  public readonly errorValue: unknown
  public readonly name: 'EmployeeAlreadyExistsError'
  public readonly status: STATUS_ERROR

  constructor(parameters: { employee: Pick<Employee, 'id'> }) {
    this.errorMessage = 'The employee already exists with the ID: ' + parameters.employee.id.value
    this.errorValue = { employee: parameters.employee }
    this.name = 'EmployeeAlreadyExistsError'
    this.status = STATUS_ERROR.CONFLICT
  }
}

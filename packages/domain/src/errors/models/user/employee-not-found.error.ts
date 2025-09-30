import { STATUS_ERROR } from '../../../shared/status-error'
import { type ID } from '../../../value-objects/id.value-object'

export class EmployeeNotFoundError {
  public readonly errorMessage: string
  public readonly errorValue: unknown
  public readonly name: 'EmployeeNotFoundError'
  public readonly status: STATUS_ERROR

  constructor(parameters: { employeeID: ID }) {
    this.errorMessage = 'The employee not found with the ID: ' + parameters.employeeID.value
    this.errorValue = { employeeID: parameters.employeeID }
    this.name = 'EmployeeNotFoundError'
    this.status = STATUS_ERROR.CONFLICT
  }
}

import { STATUS_ERROR } from '../../../shared/status-error'
import { type ID } from '../../../value-objects/id.value-object'

export class EmployeeAlreadyExistsError {
  public readonly errorMessage: string
  public readonly errorValue: unknown
  public readonly name: 'EmployeeAlreadyExistsError'
  public readonly status: STATUS_ERROR

  constructor(parameters: { employeeID: ID }) {
    this.errorMessage = 'The employee already exists with the ID: ' + parameters.employeeID.value
    this.errorValue = { employeeID: parameters.employeeID }
    this.name = 'EmployeeAlreadyExistsError'
    this.status = STATUS_ERROR.CONFLICT
  }
}

export enum UserEventType {
  CUSTOMER_CREATED = 'user.customer.created',
  EMPLOYEE_CREATED = 'user.employee.created'
}

export type CustomerCreatedEventPayload = {
  userID: string
  email: string
  name: string
}

export type EmployeeCreatedEventPayload = {
  userID: string
  name: string
}

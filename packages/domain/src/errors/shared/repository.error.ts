import { STATUS_ERROR } from '../../shared/status-error'

type ParametersConstructorDTO = {
  error: unknown
  repository: {
    /*
     * name: RepositoryNames
     * method: InvestorsRepositoryMethods
     * externalName: RepositoryExternalName
     */
    name: string
    method: string
    externalName: string
  }
}

/*
 * export enum RepositoryExternalName {
 *   PRISMA = 'prisma',
 *   TYPEORM = 'typeorm'
 * }
 */

/*
 * export enum RepositoryNames {
 *   INVESTORS = 'investors'
 * }
 */

/*
 * export enum InvestorsRepositoryMethods {
 *   SAVE = 'save',
 *   VALIDATE_EMAIL = 'validate email',
 *   VALIDATE_ID = 'validate id',
 *   VALIDATE_WHATSAPP = 'validate whatsapp'
 * }
 */

export class RepositoryError {
  readonly status: STATUS_ERROR
  readonly errorMessage: string
  readonly name: 'RepositoryError'
  readonly errorValue: unknown

  constructor(parameters: ParametersConstructorDTO) {
    this.errorMessage = `Error in ${parameters.repository.name} repository in ${parameters.repository.method} method.${
      parameters.repository.externalName === ''
        ? ''
        : ` Error in external lib name: ${parameters.repository.externalName}.`
    }`
    this.errorValue = parameters.error
    this.name = 'RepositoryError'
    this.status = STATUS_ERROR.REPOSITORY_ERROR
  }
}

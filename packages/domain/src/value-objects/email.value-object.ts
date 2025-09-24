import { type Either, failure, success } from '@niki/utils'

import { InvalidEmailError } from '../errors/value-objects/email/invalid-email.error'

export class Email {
  public readonly value: string
  public readonly isVerified: boolean

  private constructor(parameters: { email: string; isVerified: boolean }) {
    this.value = parameters.email.toLowerCase().trim()
    this.isVerified = parameters.isVerified
    Object.freeze(this)
  }

  public static getDomain(parameters: { email: Email }): Either<InvalidEmailError, { domain: string }> {
    const [, domain] = parameters.email.value.split('@')
    if (!domain || domain.trim() === '') return failure(new InvalidEmailError({ email: parameters.email.value }))
    return success({ domain })
  }

  public static validateEmail(parameters: {
    email: string
    isVerified: boolean
  }): Either<InvalidEmailError, { emailValidated: Email }> {
    const emailFormatted = parameters.email.toLowerCase().trim()
    const MAX_EMAIL_SIZE = 320
    if (
      Email.emptyOrTooLarge({
        string: emailFormatted,
        maxSize: MAX_EMAIL_SIZE
      }) ||
      Email.nonConformant(emailFormatted)
    ) {
      return failure(new InvalidEmailError({ email: emailFormatted }))
    }
    const [local, domain] = emailFormatted.split('@')
    const MAX_LOCAL_SIZE = 64
    const MAX_DOMAIN_SIZE = 255
    if (!local || local.trim() === '') return failure(new InvalidEmailError({ email: emailFormatted }))
    if (!domain || domain.trim() === '') return failure(new InvalidEmailError({ email: emailFormatted }))
    if (
      Email.emptyOrTooLarge({
        string: local,
        maxSize: MAX_LOCAL_SIZE
      }) ||
      Email.emptyOrTooLarge({
        string: domain,
        maxSize: MAX_DOMAIN_SIZE
      })
    ) {
      return failure(new InvalidEmailError({ email: emailFormatted }))
    }
    if (Email.somePartIsTooLargeIn(domain)) return failure(new InvalidEmailError({ email: emailFormatted }))
    return success({ emailValidated: new Email({ email: emailFormatted, isVerified: parameters.isVerified }) })
  }

  private static emptyOrTooLarge(parameters: { string: string; maxSize: number }): boolean {
    return !parameters.string || parameters.string.length > parameters.maxSize
  }

  private static nonConformant(email: string): boolean {
    const emailRegex =
      /^[\w!#$%&'*+/=?^`{|}~-](?:\.?[\w!#$%&'*+/=?^`{|}~-])*@[\dA-Z](?:-*\.?[\dA-Z])*\.[A-Z](?:-?[\dA-Z])+$/i
    return !emailRegex.test(email)
  }

  private static somePartIsTooLargeIn(domain: string): boolean {
    const maxPartSize = 63
    const domainParts = domain.split('.')
    return domainParts.some((part) => part.length > maxPartSize)
  }

  public static createEmail(parameters: { email: string }): Either<InvalidEmailError, { emailCreated: Email }> {
    const resultValidateEmailAddress = Email.validateEmail({ email: parameters.email, isVerified: false })
    if (resultValidateEmailAddress.isFailure()) return failure(resultValidateEmailAddress.value)
    const { emailValidated } = resultValidateEmailAddress.value
    return success({ emailCreated: new Email({ email: emailValidated.value, isVerified: false }) })
  }

  public equals(parameters: { emailToCompare: Pick<Email, 'value'> }): boolean {
    return this.value.toLowerCase().trim() === parameters.emailToCompare.value.toLowerCase().trim()
  }
}

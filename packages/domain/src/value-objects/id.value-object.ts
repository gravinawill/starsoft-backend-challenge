import { randomUUID } from 'node:crypto'

import { type Either, failure, success } from '@niki/utils'

import { GenerateIDError } from '../errors/value-objects/id/generate-id.error'
import { InvalidIDError } from '../errors/value-objects/id/invalid-id.error'

export class ID {
  public readonly value: string

  private constructor(parameters: { id: string }) {
    this.value = parameters.id.trim()
    Object.freeze(this)
  }

  public toString(): string {
    return this.value
  }

  public static validate(
    parameters: { id: string; modelName: string } | { id: string; valueObjectName: string }
  ): Either<InvalidIDError, { idValidated: ID }> {
    const id = parameters.id.trim()
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return failure(
        new InvalidIDError({
          id,
          ...('modelName' in parameters
            ? { modelName: parameters.modelName }
            : { valueObjectName: parameters.valueObjectName })
        })
      )
    }
    return success({ idValidated: new ID({ id }) })
  }

  public static generate(
    parameters: { modelName: string } | { valueObjectName: string }
  ): Either<GenerateIDError, { idGenerated: ID }> {
    try {
      return success({ idGenerated: new ID({ id: randomUUID({ disableEntropyCache: true }).trim() }) })
    } catch (error: unknown) {
      return failure(
        new GenerateIDError({
          ...('modelName' in parameters
            ? { modelName: parameters.modelName }
            : { valueObjectName: parameters.valueObjectName }),
          error: error instanceof Error ? error : new Error(String(error))
        })
      )
    }
  }
  public equals(parameters: { otherID: ID }): boolean {
    if (!(parameters.otherID instanceof ID)) {
      return false
    }
    return this.value.toLowerCase().trim() === parameters.otherID.value.toLowerCase().trim()
  }
}

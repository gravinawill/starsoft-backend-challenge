import { randomUUID } from 'node:crypto'

import { type Either, failure, success } from '@niki/utils'

import { GenerateIDError } from '../errors/value-objects/id/generate-id.error'
import { InvalidIDError } from '../errors/value-objects/id/invalid-id.error'

export class ID {
  public readonly value: string

  constructor(parameters: { id: string }) {
    this.value = parameters.id
    Object.freeze(this)
  }

  public toString(): string {
    return this.value
  }

  public static validate(
    parameters: { id: string; modelName: string } | { id: string; valueObjectName: string }
  ): Either<InvalidIDError, { idValidated: ID }> {
    if (parameters.id.length !== 36) {
      return failure(
        new InvalidIDError({
          id: parameters.id,
          ...('modelName' in parameters
            ? { modelName: parameters.modelName }
            : { valueObjectName: parameters.valueObjectName })
        })
      )
    }
    return success({ idValidated: new ID({ id: parameters.id }) })
  }

  public static generate(
    parameters: { modelName: string } | { valueObjectName: string }
  ): Either<GenerateIDError, { idGenerated: ID }> {
    try {
      return success({ idGenerated: new ID({ id: randomUUID({ disableEntropyCache: true }) }) })
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
    return this.value === parameters.otherID.value
  }
}

import { type Product } from '@models/product.model'
import { STATUS_ERROR } from '@niki/domain'

export class ProductAlreadyExistsError {
  public readonly errorMessage: string
  public readonly errorValue: unknown
  public readonly name: 'ProductAlreadyExistsError'
  public readonly status: STATUS_ERROR

  constructor(parameters: { product: Pick<Product, 'id'> }) {
    this.errorMessage = `The product already exists with the ID: ${parameters.product.id.value}`
    this.errorValue = { product: parameters.product }
    this.name = 'ProductAlreadyExistsError'
    this.status = STATUS_ERROR.CONFLICT
  }
}

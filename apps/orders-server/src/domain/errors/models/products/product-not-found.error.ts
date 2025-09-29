import { type Product } from '@models/product.model'
import { STATUS_ERROR } from '@niki/domain'

export class ProductNotFoundError {
  public readonly errorMessage: string
  public readonly errorValue: unknown
  public readonly name: 'ProductNotFoundError'
  public readonly status: STATUS_ERROR

  constructor(parameters: { product: Pick<Product, 'id'> }) {
    this.errorMessage = `The product was not found with the ID: ${parameters.product.id.value}`
    this.errorValue = { product: parameters.product }
    this.name = 'ProductNotFoundError'
    this.status = STATUS_ERROR.NOT_FOUND
  }
}

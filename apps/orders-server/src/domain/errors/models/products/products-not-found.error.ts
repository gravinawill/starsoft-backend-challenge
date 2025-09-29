import { type Product } from '@models/product.model'
import { STATUS_ERROR } from '@niki/domain'

export class ProductsNotFoundError {
  public readonly errorMessage: string
  public readonly errorValue: unknown
  public readonly name: 'ProductsNotFoundError'
  public readonly status: STATUS_ERROR

  constructor(parameters: { products: Array<Pick<Product, 'id'>> }) {
    this.errorMessage = `The products were not found with the IDs: ${parameters.products.map((product) => product.id.value).join(', ')}`
    this.errorValue = { products: parameters.products }
    this.name = 'ProductsNotFoundError'
    this.status = STATUS_ERROR.NOT_FOUND
  }
}

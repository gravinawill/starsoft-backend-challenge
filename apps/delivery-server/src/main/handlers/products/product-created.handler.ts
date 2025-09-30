import { makeCreateProductByEventUseCase } from '@main/factories/use-cases/products/create-product-by-event-use-case.factory'
import { type ProductsProductCreatedEventPayload } from '@niki/domain'
import { makeLoggerProvider } from '@niki/logger'

export async function handleProductCreated(parameters: { payload: ProductsProductCreatedEventPayload }): Promise<void> {
  const resultCreateProduct = await makeCreateProductByEventUseCase().execute({ event: parameters.payload })
  if (resultCreateProduct.isFailure()) {
    makeLoggerProvider().sendLogError({
      message: '❌ Failed to create product',
      value: { error: resultCreateProduct.value }
    })
  } else {
    makeLoggerProvider().sendLogInfo({
      message: `✅ Product created successfully: ${resultCreateProduct.value.productCreated.id.value}`
    })
  }
}

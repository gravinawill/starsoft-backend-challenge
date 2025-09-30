import { Elasticsearch } from '@elasticsearch/elasticsearch'
import { SearchProductsElasticsearch } from '@elasticsearch/search-products.elasticsearch'
import { type RouteHandler } from '@hono/zod-openapi'
import { makeLoggerProvider } from '@niki/logger'
import { type Either, failure, success } from '@niki/utils'
import {
  type SearchProductsErrorResponse,
  type SearchProductsQuery,
  type SearchProductsSuccessResponse
} from '@routes/products/search-products/search-product.schema'
import { type searchProductsRoute } from '@routes/products/search-products/search-products.route'
// @ts-expect-error - ignore type error
export const searchProductsController: RouteHandler<typeof searchProductsRoute> = async (c) => {
  const startTime = Date.now()
  const requestID = c.req.header('x-request-id') ?? 'unknown'
  const logger = makeLoggerProvider()

  try {
    const query = c.req.valid('query')

    const priceValidation = validatePriceRange({ query })
    if (priceValidation.isFailure()) {
      const errorResponse: SearchProductsErrorResponse = {
        error: { name: 'ValidationError', message: priceValidation.value.error ?? 'Invalid price range' }
      }
      return c.json(errorResponse, 400)
    }

    const { page = 1, page_size: pageSize = 20 } = query
    const from = (page - 1) * pageSize
    const size = pageSize

    const elasticsearchService = new SearchProductsElasticsearch(
      Elasticsearch.getInstance().getClient(),
      Elasticsearch.getInstance().getConfig()
    )

    const searchParams = {
      query: {
        isAvailable: query.is_available,
        minPriceInCents: query.min_price_in_cents,
        maxPriceInCents: query.max_price_in_cents,
        name: query.name,
        page,
        pageSize,
        sortBy: query.sort_by,
        sortOrder: query.sort_order
      },
      from,
      size
    }

    logger.sendLogInfo({
      message: 'Search request initiated',
      data: {
        requestID,
        searchParams: {
          page,
          pageSize,
          name: query.name,
          sortBy: query.sort_by,
          sortOrder: query.sort_order
        }
      }
    })

    const result = await elasticsearchService.execute(searchParams)
    const responseTime = Date.now() - startTime

    if (result.isFailure()) {
      logger.sendLogError({
        message: 'Search request failed',
        value: {
          requestID,
          error: result.value.error,
          responseTime
        }
      })

      const errorResponse: SearchProductsErrorResponse = {
        error: { name: result.value.error.name, message: result.value.error.message }
      }
      return c.json(errorResponse, 400)
    }

    const totalPages = Math.ceil(result.value.totalCount / pageSize)
    const hasNextPage = page < totalPages
    const hasPreviousPage = page > 1

    const responseSuccess: SearchProductsSuccessResponse = {
      success: {
        products: result.value.products.map((product) => ({
          id: product.id,
          name: product.name,
          price_in_cents: product.priceInCents,
          image_url: product.imageURL,
          is_available: product.isAvailable,
          created_at: product.createdAt
        })),
        message: 'Products found successfully',
        pagination: {
          page,
          page_size: pageSize,
          total_count: result.value.totalCount,
          total_pages: totalPages,
          has_next_page: hasNextPage,
          has_previous_page: hasPreviousPage
        }
      }
    }

    return c.json(responseSuccess, 200)
  } catch (error) {
    const responseTime = Date.now() - startTime

    logger.sendLogError({
      message: 'Unexpected error in search controller',
      value: {
        requestID,
        error,
        responseTime
      }
    })

    const errorResponse: SearchProductsErrorResponse = {
      error: { name: 'InternalServerError', message: 'An unexpected error occurred' }
    }
    return c.json(errorResponse, 500)
  }
}

function validatePriceRange(parameters: { query: SearchProductsQuery }): Either<{ error?: string }, null> {
  const { min_price_in_cents, max_price_in_cents } = parameters.query
  if (
    typeof min_price_in_cents === 'number' &&
    typeof max_price_in_cents === 'number' &&
    min_price_in_cents > max_price_in_cents
  ) {
    return failure({ error: 'Minimum price must be less than or equal to maximum price' })
  }
  return success(null)
}

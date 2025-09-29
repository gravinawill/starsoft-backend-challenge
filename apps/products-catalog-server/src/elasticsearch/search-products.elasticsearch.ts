import { Product, SortBySearchProductsEnum, SortOrderSearchProductsEnum } from '@models/product'

import { Client } from '@elastic/elasticsearch'
import { type QueryDslQueryContainer, type SortCombinations } from '@elastic/elasticsearch/lib/api/types'
import { type ILoggerProvider } from '@niki/domain'
import { productsCatalogServerENV } from '@niki/env'
import { makeLoggerProvider } from '@niki/logger'
import { type Either, failure, success } from '@niki/utils'

export type SearchProductsElasticsearchQuery = {
  page: number
  pageSize: number
  sortBy: SortBySearchProductsEnum
  sortOrder: SortOrderSearchProductsEnum
  name?: string
  minPriceInCents?: number
  maxPriceInCents?: number
  isAvailable?: boolean
}

export type SearchProductsElasticsearchParams = {
  query: SearchProductsElasticsearchQuery
  from: number
  size: number
}

type ProductElasticsearchSource = {
  productID: string
  name: string
  priceInCents: number
  imageURL: string | null
  isAvailable: boolean
  createdAt: string
  updatedAt: string
}

export class SearchProductsElasticsearch {
  private readonly client: Client
  private readonly config: Readonly<{ host: string; indexName: string; requestTimeout: number; maxRetries: number }>
  private readonly logger: ILoggerProvider

  constructor() {
    this.config = {
      host: productsCatalogServerENV.ELASTICSEARCH_HOST,
      indexName: productsCatalogServerENV.ELASTICSEARCH_INDEX_PRODUCTS,
      requestTimeout: productsCatalogServerENV.ELASTICSEARCH_REQUEST_TIMEOUT,
      maxRetries: productsCatalogServerENV.ELASTICSEARCH_MAX_RETRIES
    }
    this.client = new Client({
      node: this.config.host,
      requestTimeout: this.config.requestTimeout,
      maxRetries: this.config.maxRetries
    })
    this.logger = makeLoggerProvider()
  }

  async execute(
    params: SearchProductsElasticsearchParams
  ): Promise<
    Either<{ error: { name: string; message: string } }, Readonly<{ products: Product[]; totalCount: number }>>
  > {
    try {
      const { query, from, size } = params
      const esQuery = this.buildQuery(query)
      const sort = this.buildSort(query)

      const result = await this.client.search({
        index: this.config.indexName,
        query: esQuery,
        sort,
        _source: ['name', 'productID', 'priceInCents', 'imageURL', 'isAvailable', 'createdAt', 'updatedAt'],
        from,
        size,
        track_total_hits: true
      })

      const products = this.mapElasticsearchResultsToProducts(result.hits.hits)
      const totalCount = this.extractTotalCount(result.hits.total)

      return success({ products, totalCount })
    } catch (error) {
      const elasticsearchError = this.handleElasticsearchError(error, params)
      return failure({ error: elasticsearchError })
    }
  }

  private buildQuery(query: SearchProductsElasticsearchQuery): QueryDslQueryContainer {
    const mustClauses = this.buildMustClauses(query)
    if (mustClauses.length === 0) return { match_all: {} }
    if (mustClauses.length === 1) return mustClauses[0] ?? { match_all: {} }
    return { bool: { must: mustClauses } }
  }

  private buildMustClauses(query: SearchProductsElasticsearchQuery): QueryDslQueryContainer[] {
    const mustClauses: QueryDslQueryContainer[] = []
    if (query.name?.trim()) {
      const nameSearch = query.name.trim()
      mustClauses.push({
        bool: {
          should: [
            {
              match_phrase: {
                name: {
                  query: nameSearch,
                  boost: 4 // exato tem maior peso
                }
              }
            },
            {
              match: {
                name: {
                  query: nameSearch,
                  fuzziness: 'AUTO',
                  operator: 'and',
                  boost: 2 // similaridade/typos
                }
              }
            },
            {
              prefix: {
                name: {
                  value: nameSearch.toLowerCase(),
                  boost: 1.5 // começa com
                }
              }
            },
            {
              wildcard: {
                name: {
                  value: `*${nameSearch.toLowerCase()}*`,
                  case_insensitive: true,
                  boost: 1 // contém
                }
              }
            }
          ],
          minimum_should_match: 1
        }
      })
    }

    const priceRangeClause = this.buildPriceRangeClause(query)
    if (priceRangeClause) mustClauses.push(priceRangeClause)
    if (query.isAvailable !== undefined) mustClauses.push({ term: { isAvailable: query.isAvailable } })
    return mustClauses
  }

  private buildPriceRangeClause(query: SearchProductsElasticsearchQuery): QueryDslQueryContainer | null {
    const priceRange: Record<string, number> = {}
    if (query.minPriceInCents !== undefined) priceRange.gte = query.minPriceInCents
    if (query.maxPriceInCents !== undefined) priceRange.lte = query.maxPriceInCents
    return Object.keys(priceRange).length > 0 ? { range: { priceInCents: priceRange } } : null
  }

  private buildSort(query: SearchProductsElasticsearchQuery): SortCombinations[] {
    const sortField = this.mapSortField({ sortBy: query.sortBy })
    return [{ [sortField]: { order: query.sortOrder } }]
  }

  private mapSortField(parameters: { sortBy: SortBySearchProductsEnum }): string {
    const sortFieldMapping: Record<SortBySearchProductsEnum, string> = {
      name: 'name.keyword',
      'is-available': 'isAvailable',
      'price-in-cents': 'priceInCents',
      'created-at': 'createdAt'
    }
    return sortFieldMapping[parameters.sortBy]
  }

  private mapElasticsearchResultsToProducts(hits: Array<{ _source?: unknown }>): Product[] {
    const products = hits.map((hit) => {
      const source = hit._source as ProductElasticsearchSource
      return {
        id: source.productID,
        name: source.name,
        priceInCents: source.priceInCents,
        imageURL: source.imageURL,
        isAvailable: source.isAvailable,
        createdAt: source.createdAt
      } satisfies Product
    })
    return products
  }

  private extractTotalCount(total: number | { value?: number; relation?: string } | undefined): number {
    if (typeof total === 'number') {
      return total
    }

    return total?.value ?? 0
  }

  private handleElasticsearchError(
    error: unknown,
    params: SearchProductsElasticsearchParams
  ): { name: string; message: string } {
    const errorMessage = error instanceof Error ? error.message : 'Unknown Elasticsearch error'
    const errorName = error instanceof Error ? error.constructor.name : 'ElasticsearchError'

    this.logger.sendLogError({
      message: 'Elasticsearch search failed',
      value: {
        error: {
          name: errorName,
          message: errorMessage,
          stack: error instanceof Error ? error.stack : undefined
        },
        params,
        config: { host: this.config.host, indexName: this.config.indexName }
      }
    })

    return { name: errorName, message: `Elasticsearch search failed: ${errorMessage}` }
  }
}

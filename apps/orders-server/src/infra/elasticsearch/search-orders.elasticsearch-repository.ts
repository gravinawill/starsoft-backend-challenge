import { Client } from '@elastic/elasticsearch'
import { type QueryDslQueryContainer, type SortCombinations } from '@elastic/elasticsearch/lib/api/types'
import { type Customer } from '@models/customer.model'
import { type Order, type OrderStatus, type PaymentMethod } from '@models/order.model'
import {
  type ID,
  type ILoggerProvider,
  type InvalidIDError,
  type RepositoryError as IRepositoryError,
  RepositoryError
} from '@niki/domain'
import { ordersServerENV } from '@niki/env'
import { failure, success } from '@niki/utils'
import {
  type ISearchOrdersRepository,
  type SearchOrdersRepositoryDTO
} from '@repository-contracts/orders/search.orders-repository'

type OrderElasticsearchSource = {
  orderID: string
  customerID: string
  status: OrderStatus
  paymentMethod: PaymentMethod
  totalAmountInCents: number | null
  products: Array<{
    productID: string
    quantity: number
  }>
  createdAt: string
  updatedAt: string
}

export class SearchOrdersElasticsearchRepository implements ISearchOrdersRepository {
  private readonly client: Client
  private readonly config: Readonly<{ host: string; indexName: string; requestTimeout: number; maxRetries: number }>

  constructor(private readonly logger: ILoggerProvider) {
    this.config = {
      host: ordersServerENV.ELASTICSEARCH_HOST,
      indexName: ordersServerENV.ELASTICSEARCH_INDEX_ORDERS,
      requestTimeout: ordersServerENV.ELASTICSEARCH_REQUEST_TIMEOUT,
      maxRetries: ordersServerENV.ELASTICSEARCH_MAX_RETRIES
    }
    this.client = new Client({
      node: this.config.host,
      requestTimeout: this.config.requestTimeout,
      maxRetries: this.config.maxRetries
    })
  }

  async search(parameters: SearchOrdersRepositoryDTO.Parameters): SearchOrdersRepositoryDTO.Result {
    try {
      const esQuery = this.buildQuery(parameters)
      const sort = this.buildSort()

      const result = await this.client.search({
        index: this.config.indexName,
        query: esQuery,
        sort,
        _source: ['orderID', 'customerID', 'status', 'paymentMethod', 'totalAmountInCents', 'products', 'createdAt'],
        from: parameters.pagination.from,
        size: parameters.pagination.size,
        track_total_hits: true
      })

      const foundOrders = this.mapElasticsearchResultsToOrders(result.hits.hits)
      const totalCount = this.extractTotalCount(result.hits.total)

      return success({ foundOrders, totalCount })
    } catch (error) {
      const elasticsearchError = this.handleElasticsearchError(error, parameters)
      return failure(elasticsearchError)
    }
  }

  private buildQuery(parameters: SearchOrdersRepositoryDTO.Parameters): QueryDslQueryContainer {
    const mustClauses = this.buildMustClauses(parameters)
    if (mustClauses.length === 0) return { match_all: {} }
    if (mustClauses.length === 1) return mustClauses[0] ?? { match_all: {} }
    return { bool: { must: mustClauses } }
  }

  private buildMustClauses(parameters: SearchOrdersRepositoryDTO.Parameters): QueryDslQueryContainer[] {
    const mustClauses: QueryDslQueryContainer[] = []

    // Always filter by customer ID
    mustClauses.push({
      term: {
        customerID: parameters.customer.id.value
      }
    })

    // Filter by order ID if provided
    if (parameters.filters.id) {
      mustClauses.push({
        term: {
          orderID: parameters.filters.id.value
        }
      })
    }

    // Filter by status if provided
    if (parameters.filters.status) {
      mustClauses.push({
        term: {
          status: parameters.filters.status
        }
      })
    }

    // Filter by payment method if provided
    if (parameters.filters.paymentMethod) {
      mustClauses.push({
        term: {
          paymentMethod: parameters.filters.paymentMethod
        }
      })
    }

    // Filter by date range if provided
    if (parameters.filters.rangeDate) {
      const dateRange: Record<string, string> = {}
      dateRange.gte = parameters.filters.rangeDate.startDate.toISOString()
      dateRange.lte = parameters.filters.rangeDate.endDate.toISOString()
      mustClauses.push({
        range: {
          createdAt: dateRange
        }
      })
    }

    // Filter by total amount range if provided
    const totalAmountClause = this.buildTotalAmountRangeClause(parameters.filters)
    if (totalAmountClause) {
      mustClauses.push(totalAmountClause)
    }

    return mustClauses
  }

  private buildTotalAmountRangeClause(
    filters: SearchOrdersRepositoryDTO.Parameters['filters']
  ): QueryDslQueryContainer | null {
    const amountRange: Record<string, number> = {}
    if (filters.totalAmountInCents?.min !== undefined) {
      amountRange.gte = filters.totalAmountInCents.min
    }
    if (filters.totalAmountInCents?.max !== undefined) {
      amountRange.lte = filters.totalAmountInCents.max
    }
    return Object.keys(amountRange).length > 0 ? { range: { totalAmountInCents: amountRange } } : null
  }

  private buildSort(): SortCombinations[] {
    // Sort by creation date descending (newest first)
    return [{ createdAt: { order: 'desc' } }]
  }

  private mapElasticsearchResultsToOrders(
    hits: Array<{ _source?: unknown }>
  ): Array<
    Pick<Order, 'id' | 'status' | 'createdAt' | 'products' | 'customer' | 'paymentMethod' | 'totalAmountInCents'>
  > {
    return hits.map((hit) => {
      const source = hit._source as OrderElasticsearchSource
      return {
        id: { value: source.orderID } as ID,
        status: source.status,
        createdAt: new Date(source.createdAt),
        products: source.products.map((p) => ({
          product: { id: { value: p.productID } as ID },
          quantity: p.quantity
        })),
        customer: { id: { value: source.customerID } as ID } as Pick<Customer, 'id'>,
        paymentMethod: source.paymentMethod,
        totalAmountInCents: source.totalAmountInCents
      }
    })
  }

  private extractTotalCount(total: number | { value?: number; relation?: string } | undefined): number {
    if (typeof total === 'number') {
      return total
    }
    return total?.value ?? 0
  }

  private handleElasticsearchError(
    error: unknown,
    parameters: SearchOrdersRepositoryDTO.Parameters
  ): IRepositoryError | InvalidIDError {
    const errorMessage = error instanceof Error ? error.message : 'Unknown Elasticsearch error'
    const errorName = error instanceof Error ? error.constructor.name : 'ElasticsearchError'

    this.logger.sendLogError({
      message: 'Elasticsearch search failed for orders',
      value: {
        error: {
          name: errorName,
          message: errorMessage,
          stack: error instanceof Error ? error.stack : undefined
        },
        parameters,
        config: { host: this.config.host, indexName: this.config.indexName }
      }
    })

    return new RepositoryError({
      error,
      repository: {
        name: 'orders',
        method: 'search',
        externalName: 'elasticsearch'
      }
    })
  }
}

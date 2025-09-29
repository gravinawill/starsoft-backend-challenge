import { faker } from '@faker-js/faker'
import axios from 'axios'

interface ProductData {
  name: string
  priceInCents: number
  availableCount: number
}

interface ScriptOptions {
  count: number
  url: string
  token: string
  delay: number
}

function generateProduct(): ProductData {
  const categories = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Beauty', 'Toys', 'Automotive']

  const productTypes = {
    Electronics: [
      () => `Wireless ${faker.commerce.productName()}`,
      () => `${faker.commerce.productMaterial()} ${faker.commerce.product()}`,
      () => `${faker.company.name()} ${faker.commerce.productAdjective()} Device`
    ],
    Clothing: [
      () => `${faker.commerce.productAdjective()} ${faker.commerce.productName()}`,
      () => `${faker.color.human()} ${faker.commerce.product()}`,
      () => `${faker.company.name()} ${faker.commerce.productMaterial()} Wear`
    ],
    Books: [
      () => `${faker.lorem.words(3)} - ${faker.person.fullName()}`,
      () => `The ${faker.commerce.productAdjective()} Guide to ${faker.lorem.words(2)}`,
      () => `${faker.company.name()} ${faker.commerce.product()} Manual`
    ],
    'Home & Garden': [
      () => `${faker.commerce.productAdjective()} ${faker.commerce.productName()}`,
      () => `${faker.commerce.productMaterial()} ${faker.commerce.product()}`,
      () => `${faker.company.name()} Home ${faker.commerce.product()}`
    ],
    Sports: [
      () => `Professional ${faker.commerce.productName()}`,
      () => `${faker.commerce.productAdjective()} ${faker.commerce.product()} Equipment`,
      () => `${faker.company.name()} ${faker.commerce.product()} Kit`
    ],
    Beauty: [
      () => `${faker.commerce.productAdjective()} ${faker.commerce.productName()}`,
      () => `${faker.commerce.productMaterial()} Beauty ${faker.commerce.product()}`,
      () => `${faker.company.name()} ${faker.commerce.product()} Set`
    ],
    Toys: [
      () => `${faker.commerce.productAdjective()} ${faker.commerce.productName()}`,
      () => `${faker.commerce.productMaterial()} ${faker.commerce.product()} Toy`,
      () => `${faker.company.name()} ${faker.commerce.product()} Game`
    ],
    Automotive: [
      () => `${faker.commerce.productAdjective()} ${faker.commerce.productName()}`,
      () => `${faker.commerce.productMaterial()} Auto ${faker.commerce.product()}`,
      () => `${faker.company.name()} ${faker.commerce.product()} Part`
    ]
  }

  const category = faker.helpers.arrayElement(categories)
  const typeGenerators = productTypes[category as keyof typeof productTypes]
  const nameGenerator = faker.helpers.arrayElement(typeGenerators)

  return {
    name: nameGenerator(),
    priceInCents: faker.number.int({ min: 999, max: 99_999 }), // $9.99 to $999.99
    availableCount: faker.number.int({ min: 1, max: 1000 })
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function parseArgs(): ScriptOptions {
  const args = process.argv.slice(2)
  const options: ScriptOptions = {
    count: 1_000_000,
    url: 'http://localhost:2227/products',
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NTkwNDI1NTUsImV4cCI6MTc1OTkwNjU1NSwiaXNzIjoiaXNzdWVyIiwic3ViIjoiNWIyYWI2NTItMDVhOC00YjQ4LTg0M2QtMjhlNDUzZDFiYzIzIn0.8DFFxwI30ZOlVQEPdHvelsZ3nBDCrNXt0QyzBrPPnG4',
    delay: 0
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    switch (arg) {
      case '--count':
      case '-c': {
        i++
        const nextArg = args[i]
        options.count = nextArg ? Number.parseInt(nextArg, 10) : 20
        break
      }
      case '--url':
      case '-u': {
        i++
        const nextArg = args[i]
        options.url = nextArg ?? options.url
        break
      }
      case '--token':
      case '-t': {
        i++
        const nextArg = args[i]
        options.token = nextArg ?? options.token
        break
      }
      case '--delay':
      case '-d': {
        i++
        const nextArg = args[i]
        options.delay = nextArg ? Number.parseInt(nextArg, 10) : 100
        break
      }
      case '--help':
      case '-h': {
        console.log(`
Usage: pnpm scripts:create-many-products [options]

Options:
  -c, --count <number>    Number of products to create (default: 20)
  -u, --url <url>         API URL (default: http://localhost:2227/products)
  -t, --token <token>     Bearer token for authentication
  -d, --delay <ms>        Delay between requests in milliseconds (default: 100)
  -h, --help             Show this help message

Environment variables:
  PRODUCT_API_TOKEN      Bearer token for authentication (can be used instead of --token)
`)
        throw new Error('Help displayed')
      }
    }
  }

  if (!options.token) {
    console.error('Error: Token is required. Use --token option or set PRODUCT_API_TOKEN environment variable.')
    throw new Error('Token is required')
  }

  return options
}

async function createProduct(url: string, token: string, product: ProductData): Promise<boolean> {
  try {
    const response = await axios.post(url, product, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      timeout: 10_000 // 10 seconds timeout
    })

    console.log(`✅ Produto criado: ${product.name}`)
    console.log(`   📦 Preço: $${(product.priceInCents / 100).toFixed(2)}`)
    console.log(`   📊 Estoque: ${product.availableCount} unidades`)
    console.log(`   🔗 ID: ${response.data?.id ?? 'N/A'}`)
    console.log('')

    return true
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`❌ Erro ao criar produto "${product.name}":`)
      console.error(`   Status: ${error.response?.status ?? 'Unknown'}`)
      console.error(`   Message: ${error.response?.data?.message ?? error.message}`)
    } else {
      console.error(`❌ Erro inesperado ao criar produto "${product.name}":`, error)
    }
    console.log('')

    return false
  }
}

async function main(): Promise<void> {
  const options = parseArgs()

  console.log('🚀 Iniciando criação de produtos...')
  console.log(`📊 Quantidade: ${options.count}`)
  console.log(`🔗 URL: ${options.url}`)
  console.log(`⏱️  Delay: ${options.delay}ms`)
  console.log('')

  const products = Array.from({ length: options.count }, () => generateProduct())

  let successCount = 0
  let errorCount = 0

  for (let i = 0; i < products.length; i++) {
    const product = products[i]!
    console.log(`[${i + 1}/${options.count}] Criando produto...`)

    const success = await createProduct(options.url, options.token, product)

    if (success) {
      successCount++
    } else {
      errorCount++
    }

    // Delay entre requests para não sobrecarregar a API
    if (i < products.length - 1) {
      await delay(options.delay)
    }
  }

  console.log('🎉 Processo concluído!')
  console.log(`✅ Produtos criados com sucesso: ${successCount}`)
  if (errorCount > 0) {
    console.log(`❌ Erros: ${errorCount}`)
  }
}

try {
  await main()
} catch (error: unknown) {
  console.error('❌ Erro geral:', error)
  throw error
}

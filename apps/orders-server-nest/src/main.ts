import { Logger, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { type MicroserviceOptions, Transport } from '@nestjs/microservices'
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { apiReference } from '@scalar/nestjs-api-reference'

import { AppModule } from './app.module'
import { ValidationException } from './shared/exceptions/business.exception'
import { HttpExceptionFilter } from './shared/filters/http-exception.filter'
import { AppLogger } from './shared/logger/logger.service'

async function bootstrap() {
  const logger = new Logger('Bootstrap')
  try {
    const app = await NestFactory.create<NestFastifyApplication>(
      AppModule,
      new FastifyAdapter({
        logger: true
      })
    )

    const appLogger = await app.resolve(AppLogger)

    // Configure CORS
    app.enableCors({
      origin: process.env.CORS_ORIGIN?.split(',') ?? '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
      preflightContinue: false,
      optionsSuccessStatus: 204
    })

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true
        },
        disableErrorMessages: false,
        validationError: {
          target: false,
          value: false
        },
        exceptionFactory: (errors) => {
          // eslint-disable-next-line unicorn/no-array-reduce -- we need to return an array of errors
          const formattedErrors = errors.reduce<Array<{ field: string; messages: string[]; value?: unknown }>>(
            (acc, error) => {
              const field = error.property
              const constraints = error.constraints ?? {}
              const childrenErrors = error.children ?? []

              if (Object.keys(constraints).length > 0) {
                acc.push({
                  field,
                  messages: Object.values(constraints),
                  value: error.value
                })
              }

              if (childrenErrors.length > 0) {
                for (const childError of childrenErrors) {
                  const childField = `${field}.${childError.property}`
                  const childConstraints = childError.constraints ?? {}

                  if (Object.keys(childConstraints).length > 0) {
                    acc.push({
                      field: childField,
                      messages: Object.values(childConstraints),
                      value: childError.value
                    })
                  }
                }
              }

              return acc
            },
            []
          )

          const errorMessage = formattedErrors.map((e) => `${e.field}: ${e.messages.join(', ')}`).join('; ')

          return new ValidationException(`Validation error: ${errorMessage}`)
        }
      })
    )

    app.useGlobalFilters(new HttpExceptionFilter(appLogger))

    const config = new DocumentBuilder()
      .setTitle('Orders Server')
      .setDescription('API for order management')
      .setVersion('1.0.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'authorization',
          description: 'JWT token for authentication',
          in: 'header'
        },
        'authorization'
      )
      .addTag('Orders', 'Endpoints for order management')
      .setContact('API Support', 'https://api-support.example.com', 'api@example.com')
      .setLicense('MIT', 'https://opensource.org/licenses/MIT')
      .build()

    const document = SwaggerModule.createDocument(app, config, {
      operationIdFactory: (controllerKey: string, methodKey: string) => methodKey
    })

    SwaggerModule.setup('api', app, document)

    // Setup Scalar API Reference
    app.use(
      '/docs',
      apiReference({
        theme: 'purple',
        content: document,
        layout: 'modern',
        withFastify: true,
        authentication: {
          preferredSecurityScheme: 'authorization'
        }
      })
    )

    // Optional: Setup Swagger UI as well
    SwaggerModule.setup('swagger', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha'
      }
    })

    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: 'orders-server',
          brokers: [process.env.MESSAGE_BROKER_PROVIDER_BROKER_URL ?? 'localhost:9092'],
          retry: {
            initialRetryTime: 100,
            retries: 8
          }
        },
        consumer: {
          groupId: 'orders-consumer-group',
          sessionTimeout: 30_000,
          heartbeatInterval: 3000
        },
        producer: {
          allowAutoTopicCreation: true,
          transactionTimeout: 60_000
        }
      }
    })

    await app.startAllMicroservices()
    logger.log('[ORDERS-SERVER] Kafka microservices started successfully')

    const port = process.env.ORDERS_SERVER_PORT ?? 2220
    const host = process.env.ORDERS_SERVER_HOST ?? '0.0.0.0'
    await app.listen(port, host)

    logger.log(`[ORDERS-SERVER] HTTP server running at http://${host}:${port}`)
    logger.log(`[ORDERS-SERVER] API documentation available at:`)
    logger.log(`  - Scalar: http://localhost:${port}/docs`)
    logger.log(`  - Swagger: http://localhost:${port}/swagger`)
    logger.log(`[ORDERS-SERVER] Health check: http://localhost:${port}/health`)

    const signals = ['SIGTERM', 'SIGINT']
    for (const signal of signals) {
      process.on(signal, async () => {
        logger.log(`[ORDERS-SERVER] Received signal ${signal}, starting graceful shutdown...`)
        await app.close()
        logger.log('[ORDERS-SERVER] Application shut down successfully')
        process.exit(0)
      })
    }

    process.on('uncaughtException', (error) => {
      logger.error('[ORDERS-SERVER] Uncaught error:', error)
      process.exit(1)
    })

    process.on('unhandledRejection', (reason) => {
      logger.error('[ORDERS-SERVER] Unhandled rejected promise:', reason)
      process.exit(1)
    })
  } catch (error) {
    logger.error('[ORDERS-SERVER] Error initializing application:', error)
    // eslint-disable-next-line unicorn/no-process-exit -- we need to use process.exit
    process.exit(1)
  }
}

// eslint-disable-next-line unicorn/prefer-top-level-await -- we need to use process.exit
bootstrap().catch((error: unknown) => {
  console.error('[ORDERS-SERVER] Critical failure during initialization:', error)
  // eslint-disable-next-line unicorn/no-process-exit -- we need to use process.exit
  process.exit(1)
})

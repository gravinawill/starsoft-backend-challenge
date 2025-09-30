import { fastifyCors } from '@fastify/cors'
import fastifySwagger from '@fastify/swagger'
import { usersServerENV } from '@main/users-server.env'
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from '@marcalexiei/fastify-type-provider-zod'
import { routes } from '@routes/_routes'
import fastifyApiReference from '@scalar/fastify-api-reference'
import { fastify } from 'fastify'

import { type FastifyTypedInstance, openapiConfig, scalarApiReferenceConfig } from './docs/openapi.docs'

export async function buildServer(): Promise<FastifyTypedInstance> {
  const server = fastify({
    disableRequestLogging: false,
    requestIdHeader: 'x-request-id',
    requestIdLogLabel: 'requestId',
    genReqId: (req) => {
      return typeof req.headers['x-request-id'] === 'string' ? req.headers['x-request-id'] : crypto.randomUUID()
    },
    logger: {
      level: 'info',
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'yyyy-mm-dd HH:MM:ss Z',
          ignore: 'pid,hostname',
          messageFormat: '[{requestId}] {msg}',
          singleLine: false,
          hideObject: false
        }
      }
    }
  }).withTypeProvider<ZodTypeProvider>()

  server.setSerializerCompiler(serializerCompiler)
  server.setValidatorCompiler(validatorCompiler)

  // loggerMiddleware(server)

  await server.register(fastifyCors as never, {
    origin: usersServerENV.ENVIRONMENT === 'production' ? ['https://niki.gravina.dev'] : ['*'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
    credentials: true
  })

  await server.register(fastifySwagger as never, openapiConfig)
  await server.register(fastifyApiReference as never, scalarApiReferenceConfig)
  await server.register(routes)

  server.setNotFoundHandler({}, async (request, reply) => {
    return reply.status(404).send({
      success: null,
      error: {
        name: 'NotFound',
        message: `Route ${request.method} ${request.url} not found`
      }
    })
  })

  return server
}

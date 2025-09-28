import { fastifyCors } from '@fastify/cors'
import fastifySwagger from '@fastify/swagger'
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from '@marcalexiei/fastify-type-provider-zod'
import { usersServerENV } from '@niki/env'
import { routes } from '@routes/_routes'
import fastifyApiReference from '@scalar/fastify-api-reference'
import { fastify } from 'fastify'

import { type FastifyTypedInstance, openapiConfig, scalarApiReferenceConfig } from './docs/openapi.docs'

export async function buildServer(): Promise<FastifyTypedInstance> {
  const server = fastify({
    disableRequestLogging: false,
    requestIdHeader: 'x-request-id',
    requestIdLogLabel: 'requestID',
    ...(usersServerENV.ENVIRONMENT === 'production'
      ? { logger: true }
      : {
          logger: {
            transport: {
              target: 'pino-pretty',
              options: {
                colorize: true,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname'
              }
            }
          }
        })
  }).withTypeProvider<ZodTypeProvider>()

  server.setSerializerCompiler(serializerCompiler)
  server.setValidatorCompiler(validatorCompiler)

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

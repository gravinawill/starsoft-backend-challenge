import { type SwaggerOptions } from '@fastify/swagger'
import {
  createJsonSchemaTransform,
  createJsonSchemaTransformObject,
  type ZodOpenApiSchemaMetadata,
  type ZodTypeProvider
} from '@marcalexiei/fastify-type-provider-zod'
import { usersServerENV } from '@niki/env'
import { type FastifyApiReferenceOptions } from '@scalar/fastify-api-reference'
import {
  type FastifyBaseLogger,
  type FastifyInstance,
  type FastifyRegisterOptions,
  type RawReplyDefaultExpression,
  type RawRequestDefaultExpression,
  type RawServerDefault
} from 'fastify'
import { registry } from 'zod'

import { version } from '../../../package.json'

import { tags } from './tags.docs'

export type FastifyTypedInstance = FastifyInstance<
  RawServerDefault,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  FastifyBaseLogger,
  ZodTypeProvider
>

export const schemaRegistry = registry<ZodOpenApiSchemaMetadata>()

export const openapiConfig: FastifyRegisterOptions<SwaggerOptions> = {
  openapi: {
    info: {
      title: 'Niki Users Server API',
      version: version
    },
    tags,
    servers: [
      {
        url: `http://localhost:${usersServerENV.USERS_SERVER_PORT}`,
        description: 'Local Development Server'
      },
      ...(usersServerENV.ENVIRONMENT === 'production'
        ? [
            {
              url: 'https://users.niki.com',
              description: 'Production Server'
            }
          ]
        : [])
    ]
  },
  transform: createJsonSchemaTransform({ schemaRegistry }),
  transformObject: createJsonSchemaTransformObject({ schemaRegistry })
}

export const scalarApiReferenceConfig: FastifyRegisterOptions<FastifyApiReferenceOptions> = {
  routePrefix: '/docs',
  configuration: {
    theme: 'deepSpace',
    layout: 'modern',
    darkMode: true,
    hideModels: true,
    defaultOpenAllTags: true,
    metaData: {
      title: 'Niki Users Server Documentation',
      description: 'Interactive API reference for the Niki Users Server.'
    },
    searchHotKey: 'k'
  }
}

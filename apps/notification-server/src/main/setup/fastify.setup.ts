import { fastifyCors } from '@fastify/cors'
import { fastify } from 'fastify'
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod'

export function createFastifyApp() {
  const app = fastify().withTypeProvider<ZodTypeProvider>()
  app.setSerializerCompiler(serializerCompiler)
  app.setValidatorCompiler(validatorCompiler)
  app.register(fastifyCors as never, { origin: '*' })
  return app
}

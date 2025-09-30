import { ordersServerENV } from '@niki/env'
import { cors } from 'hono/cors'

export const corsMiddleware = cors({
  origin: ordersServerENV.ENVIRONMENT === 'production' ? ['https://niki.gravina.dev'] : ['*'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
  credentials: true
})

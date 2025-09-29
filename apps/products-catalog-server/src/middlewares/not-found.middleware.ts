import { type NotFoundHandler } from 'hono'

export const notFoundHandler: NotFoundHandler = (c) => {
  const requestID = c.get('requestID') ?? 'unknown'
  return c.json(
    {
      success: null,
      error: {
        name: 'NotFound',
        message: `Route ${c.req.method} ${c.req.url} not found`,
        requestID
      }
    },
    404
  )
}

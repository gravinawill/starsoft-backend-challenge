import { usersServerENV } from '@niki/env'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'postgresql',
  dbCredentials: {
    url: usersServerENV.USERS_SERVER_DATABASE_URL
  },
  schema: 'src/infra/database/drizzle/schema/*',
  out: 'src/infra/database/drizzle/migrations',
  verbose: true,
  strict: true,
  casing: 'snake_case'
})

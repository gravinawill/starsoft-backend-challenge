import { usersServerENV } from '@niki/env'
import { drizzle } from 'drizzle-orm/node-postgres'

import * as schema from './schema'

export const db = drizzle(usersServerENV.USERS_SERVER_DATABASE_URL, { schema })

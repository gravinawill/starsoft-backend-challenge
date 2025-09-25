import { UserRole } from '@niki/domain'
import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const roleEnum = pgEnum('role', [UserRole.CUSTOMER, UserRole.EMPLOYEE])

export const users = pgTable('users', {
  id: uuid('id').primaryKey().unique().notNull(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: roleEnum('role').default(UserRole.CUSTOMER).notNull(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  deletedAt: timestamp('deleted_at')
})

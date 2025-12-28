import { integer, text, boolean, pgTable, timestamp } from 'drizzle-orm/pg-core'

export const todo = pgTable('todo', {
  id: integer('id').primaryKey(),
  text: text('text').notNull(),
  done: boolean('done').default(false).notNull(),
})

export const users = pgTable('users', {
  id: integer('id').primaryKey(),
  address: text('address').notNull(),
  username: text('username').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  type: text('type').notNull(), // kols or fans
})

export type UserSelect = typeof users.$inferSelect
export type UserInsert = typeof users.$inferInsert

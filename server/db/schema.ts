import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"

export const subscribe = sqliteTable("subscribe", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  link: text("link").notNull(),
  downloadCode: text("download_code").notNull(),
  contentCode: text("content_code").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
})

export const insertSubscribeSchema = createInsertSchema(subscribe).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export const selectSubscribeSchema = createSelectSchema(subscribe)
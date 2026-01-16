import { sqliteTable, text } from "drizzle-orm/sqlite-core"

export const subscribe = sqliteTable("subscribe", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  link: text("link").notNull(),
  downloadCode: text("download_code").notNull(),
  contentCode: text("content_code").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
})
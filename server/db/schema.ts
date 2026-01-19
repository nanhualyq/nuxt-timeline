import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const subscribe = sqliteTable("subscribe", {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  link: text().notNull(),
  enable: integer({ mode: "boolean" }).notNull().default(true),
  icon: text(),
  category: text(),
  get_code: text().notNull(),
  content_code: text().notNull(),
  interval: text(),
  last_get_time: text(),
});

import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const subscriptionTable = sqliteTable("subscription", {
  id: integer().primaryKey({ autoIncrement: true }),
  enable: integer({ mode: "boolean" }).notNull().default(true),
  name: text().notNull(),
  icon: text(),
  category: text(),
  code: text().notNull(),
  interval: text(),
  last_get_time: text(),
});

export const contentTable = sqliteTable("content", {
  id: integer().primaryKey({ autoIncrement: true }),
  subscription_id: integer()
    .references(() => subscriptionTable.id)
    .notNull(),
  title: text().notNull(),
  link: text().notNull().unique(),
  time: text().notNull(),
  author: text(),
  image: text(),
  description: text(),
  content: text(),
  is_read: integer({ mode: "boolean" }).notNull().default(false),
  is_star: integer({ mode: "boolean" }).notNull().default(false),
});

export const subsLogsTable = sqliteTable("subs_logs", {
  id: integer().primaryKey({ autoIncrement: true }),
  sub_id: integer()
    .references(() => subscriptionTable.id)
    .notNull(),
  status: text({enum: ['success', 'failed']}).notNull(),
  info: text(),
  time: text().notNull(),
});
import { db } from "~~/server/db";
import { contentTable, subscriptionTable } from "~~/server/db/schema";
import { eq } from "drizzle-orm";
import { XMLParser } from "fast-xml-parser";
import * as cheerio from "cheerio";
import { createInsertSchema } from "drizzle-zod";

type Subscription = typeof subscriptionTable.$inferSelect;
type Content = typeof contentTable.$inferInsert;

export async function execCode(code: string) {
  const context = {
    XMLParser,
    cheerio,
  };
  const func = new Function("context", code);
  return await func(context);
}
async function batchInsertContent(contents: Content[], subId: number) {
  if (!Array.isArray(contents)) {
    throw new Error("contents must be an array");
  }
  if (contents.length === 0) {
    return;
  }
  const contentInsertSchema = createInsertSchema(contentTable);
  for (const item of contents) {
    item.subscription_id = subId;
    contentInsertSchema.parse(item);
  }
  return db.insert(contentTable).values(contents).onConflictDoNothing().run();
}
async function subscription_refresh_content(sub: Subscription) {
  const contents = await execCode(sub.code);
  return batchInsertContent(contents, sub.id);
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "id 不能为空",
    });
  }
  const sub = (
    await db
      .select()
      .from(subscriptionTable)
      .where(eq(subscriptionTable.id, parseInt(id)))
  ).at(0);
  if (!sub) {
    throw createError({
      statusCode: 404,
      statusMessage: "订阅不存在",
    });
  }
  const { changes = 0 } = (await subscription_refresh_content(sub)) || {};
  return changes;
});

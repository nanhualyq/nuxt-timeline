import { db } from "~~/server/db";

import {
  contentTable,
  subscriptionTable,
  subsLogsTable,
} from "~~/server/db/schema";
import { XMLParser } from "fast-xml-parser";
import * as cheerio from "cheerio";
import { createInsertSchema } from "drizzle-zod";
import z from "zod";
import { and, eq, sql } from "drizzle-orm";

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
  const contentInsertSchema = createInsertSchema(contentTable, {
    title: z.coerce.string(),
    link: z.coerce.string(),
    time: z.coerce.string(),
    author: z.coerce.string().optional(),
    image: z.coerce.string().optional(),
    description: z.coerce.string().optional(),
    content: z.coerce.string().optional(),
  });
  for (const item of contents) {
    item.subscription_id = subId;
    contentInsertSchema.parse(item);
  }
  return db.insert(contentTable).values(contents).onConflictDoNothing().run();
}
export async function subscription_refresh_content(sub: Subscription) {
  let status = "failed" as "success" | "failed";
  let info = "";
  try {
    const contents = await execCode(sub.code);
    const res = await batchInsertContent(contents, sub.id);
    status = "success";
    info = `${res?.changes || 0} rows inserted`;

    await db
      .update(subscriptionTable)
      .set({ last_get_time: new Date().toISOString() })
      .where(eq(subscriptionTable.id, sub.id))
      .run();
    return res;
  } catch (error) {
    status = "failed";
    info = error instanceof Error ? error.message : String(error);
  } finally {
    db.insert(subsLogsTable)
      .values({
        sub_id: sub.id,
        status,
        info,
        time: new Date().toISOString(),
      })
      .run();
  }
}

export async function refreshAllSubscription() {
  const subs = await db
    .select()
    .from(subscriptionTable)
    .where(
      and(
        eq(subscriptionTable.enable, true),
        sql`
          datetime(
            ${subscriptionTable.last_get_time},
            coalesce(nullif(${subscriptionTable.interval}, ''), '+1 hour')
          )
          <= datetime('now')
        `
      ),
    );
  for (const sub of subs) {
    try {
      await subscription_refresh_content(sub);
    } catch (error) {
      console.error(error);
    }
  }
}

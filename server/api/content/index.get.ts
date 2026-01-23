import { db } from "~~/server/db";
import { contentTable, subscriptionTable } from "~~/server/db/schema";
import { desc, sql, eq, getTableColumns } from "drizzle-orm";
import z from "zod";

async function queryContents(query: unknown) {
  console.log(query);
  const schema = z.object({
    limit: z.coerce.number().min(1).max(100).default(50).catch(50),
    lastId: z.coerce.number().optional(),
    lastTime: z.string().optional(),
  });
  const parsed = schema.parse(query);

  const data = await db
    .select({
      ...getTableColumns(contentTable),
      subscription: getTableColumns(subscriptionTable),
    })
    .from(contentTable)
    .leftJoin(subscriptionTable, eq(contentTable.subscription_id, subscriptionTable.id))
    .where(parsed.lastTime && parsed.lastId ? sql`${contentTable.time} < ${parsed.lastTime} OR (${contentTable.time} = ${parsed.lastTime} AND ${contentTable.id} < ${parsed.lastId})` : undefined)
    .orderBy(desc(contentTable.time))
    .limit(parsed.limit + 1);

  return {
    data: data.slice(0, parsed.limit),
    hasMore: data.length > parsed.limit,
  };
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const contents = await queryContents(query);

  return contents;
});

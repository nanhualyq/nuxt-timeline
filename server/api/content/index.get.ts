import { db } from "~~/server/db";
import { contentTable, subscriptionTable } from "~~/server/db/schema";
import { desc, sql, eq, getTableColumns, and } from "drizzle-orm";
import z from "zod";

async function queryContents(query: unknown) {
  const schema = z.object({
    limit: z.coerce.number().min(1).max(100).default(50).catch(50),
    lastId: z.coerce.number().optional(),
    lastTime: z.string().optional(),
    star: z.coerce.boolean().default(false).catch(false),
    read: z.coerce.boolean().optional(),
  });
  const parsed = schema.parse(query);
  const where = [];

  if (parsed.lastTime && parsed.lastId) {
    where.push(
      sql`(${contentTable.time} < ${parsed.lastTime} OR (${contentTable.time} = ${parsed.lastTime} AND ${contentTable.id} < ${parsed.lastId}))`,
    );
  }
  if (parsed.star) {
    where.push(eq(contentTable.is_star, parsed.star));
  }
  if (typeof parsed.read === "boolean") {
    where.push(eq(contentTable.is_read, parsed.read));
  }

  const data = await db
    .select({
      ...getTableColumns(contentTable),
      subscription: getTableColumns(subscriptionTable),
    })
    .from(contentTable)
    .leftJoin(
      subscriptionTable,
      eq(contentTable.subscription_id, subscriptionTable.id),
    )
    .where(and(...where))
    .orderBy(desc(contentTable.time), desc(contentTable.id))
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

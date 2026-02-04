import { db } from "../db/index";
import { subsLogsTable, subscriptionTable } from "../db/schema";
import { desc, eq, getTableColumns, and } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const where = [];

    if (query.status) {
      where.push(eq(subsLogsTable.status, query.status as "success"));
    }

    return db
      .select({
        ...getTableColumns(subsLogsTable),
        subscription: getTableColumns(subscriptionTable),
      })
      .from(subsLogsTable)
      .leftJoin(
        subscriptionTable,
        eq(subsLogsTable.sub_id, subscriptionTable.id),
      )
      .where(and(...where))
      .orderBy(desc(subsLogsTable.time))
      .limit(100);
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error + "",
    });
  }
});

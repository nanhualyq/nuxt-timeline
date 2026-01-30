import { db } from "~~/server/db";
import { contentTable } from "~~/server/db/schema";
import { eq, count } from "drizzle-orm";

export default defineEventHandler(async (_event) => {
  // Count of starred items using $count()
  const starredCount = await db.$count(
    contentTable,
    eq(contentTable.is_star, true),
  );

  // Count of unread items grouped by subscription
  const unreadBySubscription = await db
    .select({
      subscriptionId: contentTable.subscription_id,
      count: count(contentTable.id),
    })
    .from(contentTable)
    .where(eq(contentTable.is_read, false))
    .groupBy(contentTable.subscription_id);

  return {
    starred: starredCount,
    unreadBySubscription,
  };
});

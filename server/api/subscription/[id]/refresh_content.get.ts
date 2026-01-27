import { db } from "~~/server/db";
import { subscriptionTable } from "~~/server/db/schema";
import { eq } from "drizzle-orm";
import { subscription_refresh_content } from "~/utils/refresh";


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

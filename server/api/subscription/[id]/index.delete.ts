import { db } from "../../../db";
import {
  subscriptionTable,
  contentTable,
  subsLogsTable,
} from "../../../db/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const id = parseInt(getRouterParam(event, "id")!);

    if (isNaN(id)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid subscription ID",
      });
    }

    // Check if subscription exists first
    const subscription = await db
      .select()
      .from(subscriptionTable)
      .where(eq(subscriptionTable.id, id))
      .limit(1);

    if (!subscription.length) {
      throw createError({
        statusCode: 404,
        statusMessage: "Subscription not found",
      });
    }

    await db.delete(subsLogsTable).where(eq(subsLogsTable.sub_id, id));
    
    // Delete all content for this subscription first (foreign key constraint)
    await db.delete(contentTable).where(eq(contentTable.subscription_id, id));

    // Delete the subscription
    await db.delete(subscriptionTable).where(eq(subscriptionTable.id, id));

    return { success: true, message: "Subscription deleted successfully" };
  } catch (error) {
    console.error("Error deleting subscription:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error + "",
    });
  }
});

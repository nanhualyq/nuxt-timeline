import { db } from "../../../db/index";
import { subscriptionTable } from "../../../db/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const id = parseInt(getRouterParam(event, 'id')!);
    
    if (isNaN(id)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid subscription ID",
      });
    }

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

    return subscription[0];
  } catch (error) {
    console.error("Error fetching subscription:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch subscription",
    });
  }
});
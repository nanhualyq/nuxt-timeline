import { db } from "../../../db/index";
import { subscriptionTable } from "../../../db/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const id = parseInt(getRouterParam(event, 'id')!);
    const body = await readBody(event);
    
    if (isNaN(id)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid subscription ID",
      });
    }

    const updatedSubscription = await db
      .update(subscriptionTable)
      .set({
        ...body,
        id: undefined, // Don't allow updating the ID
      })
      .where(eq(subscriptionTable.id, id))
      .returning();

    if (!updatedSubscription.length) {
      throw createError({
        statusCode: 404,
        statusMessage: "Subscription not found",
      });
    }

    return updatedSubscription[0];
  } catch (error) {
    console.error("Error updating subscription:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to update subscription",
    });
  }
});
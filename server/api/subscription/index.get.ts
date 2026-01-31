import { db } from "../../db/index";
import { subscriptionTable } from "../../db/schema";

export default defineEventHandler(async (_event) => {
  try {
    return db.select().from(subscriptionTable).orderBy(subscriptionTable.id);
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch subscriptions",
    });
  }
});

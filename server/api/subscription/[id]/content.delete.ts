import { db } from "../../../db";
import { contentTable } from "../../../db/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, "id")!);

  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid subscription ID",
    });
  }

  // Delete all content for this subscription first
  await db.delete(contentTable).where(eq(contentTable.subscription_id, id));

  return { success: true };
});

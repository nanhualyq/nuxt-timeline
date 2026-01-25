import { contentTable } from "~~/server/db/schema";
import { db } from "~~/server/db";
import { eq } from "drizzle-orm";

export default defineEventHandler(async () => {
  try {
    await db
      .update(contentTable)
      .set({ is_read: true })
      .where(eq(contentTable.is_read, false));

    return {
      success: true,
      message: "All content items marked as read",
    };
  } catch (error) {
    throw createError({ statusCode: 500, statusMessage: error + "" });
  }
});

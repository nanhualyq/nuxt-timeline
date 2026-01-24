import { eq } from "drizzle-orm";
import { contentTable } from "~~/server/db/schema";
import { db } from "~~/server/db";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id || isNaN(Number(id))) {
    throw createError({ statusCode: 400, statusMessage: "Invalid ID" });
  }

  const body = await readBody(event);
  // Remove id from body to prevent updating primary key
  const { id: _, ...updateData } = body;

  try {
    await db.update(contentTable).set(updateData).where(eq(contentTable.id, Number(id)));
    return { success: true };
  } catch (error) {
    throw createError({ statusCode: 500, statusMessage: error + '' });
  }
});
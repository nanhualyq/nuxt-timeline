import { db } from "../../db";
import { subscribe } from "../../db/schema";
import { createInsertSchema } from "drizzle-zod";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, "id")!);
  if (isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid ID" });
  }

  const body = await readBody(event);
  const updatedAt = new Date().toISOString();
  const row = { ...body, updatedAt };
  createInsertSchema(subscribe).parse(row);

  await db
    .update(subscribe)
    .set(row)
    .where(eq(subscribe.id, id));

  return { success: true };
});

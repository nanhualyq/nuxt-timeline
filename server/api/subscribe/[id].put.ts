import { db } from "../../db";
import { insertSubscribeSchema, subscribe } from "../../db/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, "id")!);
  if (isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid ID" });
  }

  const body = await readBody(event);
  const result = insertSubscribeSchema.safeParse(body);

  if (!result.success) {
    const firstError = result.error.issues[0];
    throw createError({
      statusCode: 400,
      statusMessage: firstError?.message || "Validation failed",
    });
  }

  const updatedAt = new Date().toISOString();

  await db
    .update(subscribe)
    .set({
      ...result.data,
      updatedAt,
    })
    .where(eq(subscribe.id, id));

  return { success: true };
});

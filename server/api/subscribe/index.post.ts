import { db } from "../../db";
import { insertSubscribeSchema, subscribe } from "../../db/schema";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const result = insertSubscribeSchema.safeParse(body);

  if (!result.success) {
    const firstError = result.error.issues[0];
    throw createError({
      statusCode: 400,
      statusMessage: firstError?.message || "Validation failed",
    });
  }

  const createdAt = new Date().toISOString();
  const updatedAt = createdAt;

  await db.insert(subscribe).values({
    ...result.data,
    createdAt,
    updatedAt,
  });

  return { success: true };
});

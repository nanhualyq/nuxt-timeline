import { db } from "../../db";
import { subscribe } from "../../db/schema";
import { createInsertSchema } from "drizzle-zod";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;
    const row = { ...body, createdAt, updatedAt };
    createInsertSchema(subscribe).parse(row);

    await db.insert(subscribe).values(row);

    return { success: true };
  } catch (error) {
    throw createError({ statusCode: 500, statusMessage: error + "" });
  }
});

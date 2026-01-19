import { db } from "../../db";
import { subscribe } from "../../db/schema";
import { createInsertSchema } from "drizzle-zod";
import { eq } from "drizzle-orm";
import { omit } from "lodash-es";

export default defineEventHandler(async (event) => {
  try {
    const id = parseInt(getRouterParam(event, "id")!);
    if (isNaN(id)) {
      throw new Error("Invalid ID");
    }

    const body = await readBody(event);
    const row = { ...omit(body, ["id"]) };
    createInsertSchema(subscribe).parse(row);

    await db.update(subscribe).set(row).where(eq(subscribe.id, id));

    return { success: true };
  } catch (error) {
    throw createError({ statusCode: 500, statusMessage: error + "" });
  }
});

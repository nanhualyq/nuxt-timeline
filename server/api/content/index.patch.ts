import { inArray } from "drizzle-orm";
import { createUpdateSchema } from "drizzle-zod";
import { contentTable } from "~~/server/db/schema";
import { db } from "~~/server/db";
import z from "zod";

// Generate update schema from contentTable using drizzle-zod
const updateSchema = createUpdateSchema(contentTable).omit({
  id: true,
  subscription_id: true,
});

const batchUpdateSchema = z.object({
  ids: z.array(z.coerce.number()).min(1, "At least one ID is required"),
  updateData: updateSchema.refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided in updateData",
  }),
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  try {
    const parsed = batchUpdateSchema.parse(body);
    await db
      .update(contentTable)
      .set(parsed.updateData)
      .where(inArray(contentTable.id, parsed.ids));

    return {
      success: true,
      updatedCount: parsed.ids.length,
      message: `Successfully updated ${parsed.ids.length} content items`,
    };
  } catch (error) {
    throw createError({ statusCode: 500, statusMessage: error + "" });
  }
});

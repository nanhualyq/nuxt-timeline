import { db } from "../../db/index";
import { subscriptionTable } from "../../db/schema";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

const insertSubscriptionSchema = createInsertSchema(subscriptionTable).omit({
  id: true,
});

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const validatedData = insertSubscriptionSchema.parse(body);

    const subscription = await db
      .insert(subscriptionTable)
      .values(validatedData)
      .returning();

    return subscription[0];
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid request data",
        data: error.issues,
      });
    }

    console.error("Error creating subscription:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to create subscription",
    });
  }
});

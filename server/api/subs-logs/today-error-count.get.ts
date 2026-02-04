import { eq, and, gte } from "drizzle-orm";
import { db } from "~~/server/db";
import { subsLogsTable } from "~~/server/db/schema";

export default defineEventHandler(async (_event) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    return db.$count(
      subsLogsTable,
      and(eq(subsLogsTable.status, "failed"), gte(subsLogsTable.time, today!)),
    );
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error + "",
    });
  }
});

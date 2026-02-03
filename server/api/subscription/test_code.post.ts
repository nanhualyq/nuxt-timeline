import { execCode } from "../../../app/utils/refresh";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!body.code) {
    throw createError({
      statusCode: 400,
      statusMessage: "Code is required",
    });
  }

  try {
    return execCode(body.code);
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: (error as Error).message || "Execution failed",
    });
  }
});

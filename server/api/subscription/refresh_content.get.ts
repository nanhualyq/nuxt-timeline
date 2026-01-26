import { db } from "~~/server/db";
import { subscriptionTable } from "~~/server/db/schema";
import { subscription_refresh_content } from "./[id]/refresh_content.get";

export default defineEventHandler(async () => {
  const subs = await db.select().from(subscriptionTable);
  for (const sub of subs) {
    try {
      await subscription_refresh_content(sub);
      console.log("subscription refresh_content is ok", sub.name, sub.id);
    } catch (error) {
      console.log("subscription refresh_content is failed", error);
    }
  }
  return "ok";
});

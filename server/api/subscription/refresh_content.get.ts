import { refreshAllSubscription } from "~~/app/utils/refresh";

export default defineEventHandler(async () => {
  refreshAllSubscription();
  return "ok";
});

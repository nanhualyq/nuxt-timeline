import { Cron } from "croner";

export default defineNuxtPlugin({
//   name: "my-server-plugin",
  // This ensures the logic only runs on the server
  setup(_nuxtApp) {
    if (import.meta.server) {
      new Cron("0 * * * *", async () => {
        try {
          refreshAllSubscription();
          console.log("定时任务每小时运行一次");
        } catch (err) {
          console.error("定时任务出错：", err);
        }
      });
      console.log("cron 定时任务已启动（服务端）");
    }
  },
});

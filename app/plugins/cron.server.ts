import cron from "node-cron";

export default defineNuxtPlugin(() => {
  cron.schedule("0 * * * *", async () => {
    try {
      refreshAllSubscription();
      console.log("定时任务每小时运行一次");
    } catch (err) {
      console.error("定时任务出错：", err);
    }
  });

  console.log("cron 定时任务已启动（服务端）");
});

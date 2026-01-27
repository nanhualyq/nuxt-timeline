export default defineNuxtPlugin({
  hooks: {
    "app:mounted"() {
      setInterval(
        () => {
          try {
            refreshAllSubscription();
            console.log("定时任务每小时运行一次");
          } catch (err) {
            console.error("定时任务出错：", err);
          }
        },
        1000 * 60 * 60,
      );

      console.log("cron 定时任务已启动（服务端）");
    },
  },
});

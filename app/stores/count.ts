import { defineStore } from "pinia";

interface CountData {
  starred: number;
  unreadBySubscription: Array<{
    subscriptionId: number;
    count: number;
  }>;
}

export const useCountStore = defineStore("count", {
  state: () => ({
    starred: 0,
    unreadBySubscription: {} as Record<number, number>,
    todayErrorSubs: 0,
  }),

  actions: {
    async fetchCount() {
      const data = await $fetch<CountData>("/api/content/count");
      this.starred = data.starred;
      // Map array to object with subscriptionId as key
      this.unreadBySubscription = data.unreadBySubscription.reduce(
        (acc, item) => {
          acc[item.subscriptionId] = item.count;
          return acc;
        },
        {} as Record<number, number>,
      );
    },
    minusUnreadCount(subscriptionId: number) {
      if (this.unreadBySubscription[subscriptionId]) {
        this.unreadBySubscription[subscriptionId]--;
      }
    },
    async fetchTodayErrorCount() {
      this.todayErrorSubs = await $fetch("/api/subs-logs/today-error-count");
    },
  },

  getters: {
    totalUnread: (state) =>
      Object.values(state.unreadBySubscription).reduce(
        (sum, count) => sum + count,
        0,
      ),
    getUnreadCount: (state) => (subscriptionId: number) =>
      state.unreadBySubscription[subscriptionId] || 0,
  },
});

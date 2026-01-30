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
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchCount() {
      this.loading = true;
      this.error = null;

      try {
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
      } catch (err) {
        this.error =
          err instanceof Error ? err.message : "Failed to fetch count";
      } finally {
        this.loading = false;
      }
    },
    minusUnreadCount(subscriptionId: number) {
      if (this.unreadBySubscription[subscriptionId]) {
        this.unreadBySubscription[subscriptionId]--;
      }
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
